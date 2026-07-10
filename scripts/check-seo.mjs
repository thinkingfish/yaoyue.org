#!/usr/bin/env node
// SEO/GEO guardrail check. Run *after* `astro build` against the `dist/`
// output to verify the agent-SEO invariants still hold. Exits non-zero on
// any failure so it can gate commits / CI.
//
//   node scripts/check-seo.mjs
//
// Checks (see .claude/skills/seo-geo/SKILL.md for the why):
//   - every content page has title, non-empty description, canonical, OG + Twitter
//   - every JSON-LD block parses
//   - home page carries WebSite + ProfilePage + Person with a non-empty sameAs
//     and the stable Person @id
//   - every blog post carries a BlogPosting authored by that same Person @id,
//     with a datePublished
//   - robots.txt points at the real sitemap (not the old template domain)
//   - llms.txt exists, is well-formed, and lists every published blog post
//   - the sitemap lists the core pages

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const SITE = "https://yaoyue.org";
const PERSON_ID = `${SITE}/#person`;

const failures = [];
const fail = (msg) => failures.push(msg);

function walk(dir) {
	const out = [];
	for (const entry of readdirSync(dir)) {
		const p = join(dir, entry);
		if (statSync(p).isDirectory()) out.push(...walk(p));
		else out.push(p);
	}
	return out;
}

function read(path) {
	try {
		return readFileSync(join(DIST, path), "utf8");
	} catch {
		return null;
	}
}

// Content HTML pages we author (skip the generated Slidev bundle and 404s).
const allHtml = walk(DIST).filter((f) => f.endsWith(".html"));
const contentPages = allHtml.filter(
	(f) => !f.includes(join(DIST, "talks", "caching")) && !f.endsWith("404.html"),
);

// Attributes may be unquoted (HTML compressor), so match loosely.
const hasMeta = (html, key, attr = "property") =>
	new RegExp(`${attr}=["']?${key.replace(/[:]/g, "\\$&")}["'> ]`).test(html);

const metaContent = (html, key, attr = "property") => {
	const m = html.match(new RegExp(`<meta[^>]*${attr}=["']?${key}["']?[^>]*>`, "i"));
	if (!m) return null;
	const c = m[0].match(/content=["']?([^"'>]*)["']?/i);
	return c ? c[1] : null;
};

function jsonLdBlocks(html) {
	const blocks = [];
	const re = /application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g;
	let m;
	while ((m = re.exec(html))) blocks.push(m[1]);
	return blocks;
}

if (contentPages.length === 0) {
	fail(`No content HTML found in ${DIST}/ — did you run \`astro build\` first?`);
}

for (const file of contentPages) {
	const rel = file.replace(`${DIST}/`, "");
	const html = readFileSync(file, "utf8");

	if (!/<title>[^<]+<\/title>/.test(html)) fail(`${rel}: missing <title>`);
	if (!metaContent(html, "description", "name")) fail(`${rel}: missing/empty meta description`);
	if (!/rel=["']?canonical/.test(html)) fail(`${rel}: missing canonical link`);
	if (!hasMeta(html, "og:title")) fail(`${rel}: missing og:title`);
	if (!hasMeta(html, "og:type")) fail(`${rel}: missing og:type`);
	if (!hasMeta(html, "twitter:card", "name")) fail(`${rel}: missing twitter:card`);

	for (const block of jsonLdBlocks(html)) {
		try {
			JSON.parse(block);
		} catch (e) {
			fail(`${rel}: invalid JSON-LD (${e.message})`);
		}
	}
}

// --- Home page: WebSite + ProfilePage + Person -----------------------------
const home = read("index.html");
if (!home) {
	fail("index.html not found");
} else {
	const types = jsonLdBlocks(home)
		.flatMap((b) => {
			try {
				return [JSON.parse(b)];
			} catch {
				return [];
			}
		})
		.flatMap((o) => (Array.isArray(o) ? o : [o]));

	const website = types.find((o) => o["@type"] === "WebSite");
	const profile = types.find((o) => o["@type"] === "ProfilePage");
	const person = profile?.mainEntity ?? types.find((o) => o["@type"] === "Person");

	if (!website) fail("home: missing WebSite JSON-LD");
	if (!profile) fail("home: missing ProfilePage JSON-LD");
	if (!person) fail("home: missing Person JSON-LD");
	if (person && person["@id"] !== PERSON_ID)
		fail(`home: Person @id is "${person?.["@id"]}", expected "${PERSON_ID}"`);
	if (person && !(Array.isArray(person.sameAs) && person.sameAs.length))
		fail("home: Person.sameAs is empty — entity disambiguation links missing");
}

// --- Blog posts: BlogPosting authored by the shared Person @id --------------
const blogPosts = contentPages.filter(
	(f) => f.includes(`${DIST}/blog/`) && !f.endsWith("blog/index.html"),
);
for (const file of blogPosts) {
	const rel = file.replace(`${DIST}/`, "");
	const html = readFileSync(file, "utf8");
	const objs = jsonLdBlocks(html)
		.flatMap((b) => {
			try {
				return [JSON.parse(b)];
			} catch {
				return [];
			}
		})
		.flatMap((o) => (Array.isArray(o) ? o : [o]));
	const post = objs.find((o) => o["@type"] === "BlogPosting");
	if (!post) {
		fail(`${rel}: missing BlogPosting JSON-LD`);
		continue;
	}
	if (!post.datePublished) fail(`${rel}: BlogPosting missing datePublished`);
	const authorId = post.author?.["@id"] ?? post.author?.id;
	if (authorId !== PERSON_ID)
		fail(`${rel}: BlogPosting author @id is "${authorId}", expected "${PERSON_ID}"`);
}

// --- robots.txt -------------------------------------------------------------
const robots = read("robots.txt");
if (!robots) fail("robots.txt missing");
else {
	if (!robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`))
		fail("robots.txt: missing/incorrect Sitemap line");
	if (/cosmicthemes|landingpad/i.test(robots))
		fail("robots.txt: still references the template domain");
	// Content Signals: declare AI-usage preferences (all three signals present).
	const signal = robots.match(/^Content-Signal:\s*(.+)$/im);
	if (!signal) fail("robots.txt: missing Content-Signal directive");
	else {
		for (const key of ["ai-train", "search", "ai-input"]) {
			if (!new RegExp(`${key}=(yes|no)`).test(signal[1]))
				fail(`robots.txt: Content-Signal missing "${key}=yes|no"`);
		}
	}
}

// --- Markdown for Agents ----------------------------------------------------
// Every content page must have a pre-built .md twin (served at the same URL
// via Accept: text/markdown negotiation in functions/_middleware.js).
const expectedMd = [
	"index.md",
	"blog.md",
	"talks.md",
	...blogPosts.map((f) => f.replace(`${DIST}/`, "").replace("/index.html", ".md")),
];
for (const mdRel of expectedMd) {
	const md = read(mdRel);
	if (!md) fail(`markdown twin missing: /${mdRel}`);
	else if (!md.startsWith("---")) fail(`/${mdRel}: missing YAML frontmatter`);
}
try {
	readFileSync("functions/_middleware.js", "utf8");
} catch {
	fail("functions/_middleware.js missing — Markdown negotiation won't work");
}

// --- llms.txt ---------------------------------------------------------------
const llms = read("llms.txt");
if (!llms) fail("llms.txt missing");
else {
	if (!/^#\s+\S/.test(llms)) fail("llms.txt: must start with an H1 (`# Name`)");
	if (!/^##\s+Blog/m.test(llms)) fail("llms.txt: missing `## Blog` section");
	for (const file of blogPosts) {
		const slug = file.replace(`${DIST}/blog/`, "").replace("/index.html", "");
		if (!llms.includes(`/blog/${slug}/`)) fail(`llms.txt: does not list blog post "${slug}"`);
	}
}

// --- sitemap ----------------------------------------------------------------
const sitemap = read("sitemap-0.xml") ?? read("sitemap-index.xml");
if (!sitemap) fail("sitemap not found");
else {
	for (const path of ["/", "/blog/", "/talks/"]) {
		if (!sitemap.includes(`${SITE}${path}`)) fail(`sitemap: missing ${SITE}${path}`);
	}
}

// --- report -----------------------------------------------------------------
if (failures.length) {
	console.error(`\n✗ SEO/GEO check failed (${failures.length}):\n`);
	for (const f of failures) console.error(`  - ${f}`);
	console.error("");
	process.exit(1);
}
console.log(
	`✓ SEO/GEO check passed: ${contentPages.length} pages, ${blogPosts.length} posts, robots.txt, llms.txt, sitemap all good.`,
);
