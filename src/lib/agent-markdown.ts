// Renders clean Markdown representations of pages for AI agents that request
// `Accept: text/markdown`. The blog/bio content is authored in Markdown, so we
// serve (essentially) the source — no lossy HTML→Markdown conversion needed.
//
// Each document leads with a small YAML frontmatter block (title, description,
// url, dates) followed by the body, which is the shape agents expect.

import { SITE } from "@/data/site";

type FrontmatterValue = string | undefined;

function frontmatter(fields: Record<string, FrontmatterValue>): string {
	const lines = Object.entries(fields)
		.filter(([, v]) => v != null && v !== "")
		// Quote values so colons/hashes in titles stay valid YAML.
		.map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
	return `---\n${lines.join("\n")}\n---\n`;
}

const abs = (path: string) => new URL(path, `${SITE.url}/`).toString();

/** Home / bio page. */
export function homeMarkdown(opts: { name: string; bioBody: string }): string {
	return `${frontmatter({
		title: opts.name,
		description: SITE.description,
		url: `${SITE.url}/`,
	})}
# ${opts.name}

${opts.bioBody.trim()}

## Elsewhere on this site
- [Blog](${abs("/blog/")}) — essays on systems, software, and the people who build them.
- [Talks](${abs("/talks/")}) — public talks, podcasts, and interviews.
- [llms.txt](${abs("/llms.txt")}) — a concise, machine-readable map of this site.
`;
}

/** A single blog post — frontmatter plus the raw Markdown source body. */
export function postMarkdown(opts: {
	title: string;
	description?: string;
	slug: string;
	body: string;
	pubDate: Date;
	updatedDate?: Date;
}): string {
	const iso = (d: Date) => d.toISOString().slice(0, 10);
	return `${frontmatter({
		title: opts.title,
		description: opts.description,
		author: SITE.name,
		date: iso(opts.pubDate),
		updated: opts.updatedDate ? iso(opts.updatedDate) : undefined,
		url: abs(`/blog/${opts.slug}/`),
	})}
# ${opts.title}

${opts.body.trim()}
`;
}

/** Blog index — a linked list of posts. */
export function blogIndexMarkdown(
	posts: { title: string; slug: string; description?: string; pubDate: Date }[],
): string {
	const items = posts
		.map((p) => {
			const note = p.description ?? `Published ${p.pubDate.getUTCFullYear()}.`;
			return `- [${p.title}](${abs(`/blog/${p.slug}/`)}) — ${note}`;
		})
		.join("\n");
	return `${frontmatter({
		title: `Blog — ${SITE.name}`,
		description: "Essays by Yao Yue on systems, software, and engineering.",
		url: abs("/blog/"),
	})}
# Blog

${items}
`;
}

/** Talks / podcasts index. */
export function talksMarkdown(
	talks: { title: string; event: string; recordingUrl: string }[],
	podcasts: { title: string; event: string; recordingUrl: string }[],
): string {
	const render = (list: { title: string; event: string; recordingUrl: string }[]) =>
		list.map((t) => `- [${t.title}](${t.recordingUrl}) — ${t.event}.`).join("\n");
	return `${frontmatter({
		title: `Talks — ${SITE.name}`,
		description: "Public talks, conference presentations, podcasts, and interviews by Yao Yue.",
		url: abs("/talks/"),
	})}
# Talks

## Public talks
${render(talks)}

## Podcasts & interviews
${render(podcasts)}
`;
}

/**
 * Maps a page URL path to its companion `.md` asset path — the single source
 * of truth shared by the build-time endpoints and the runtime negotiation
 * middleware. Returns null for paths that have no Markdown twin.
 */
export function markdownPathFor(pathname: string): string | null {
	if (pathname.endsWith(".md")) return null; // already Markdown
	if (pathname === "/") return "/index.md";
	if (pathname.endsWith("/")) return `${pathname.slice(0, -1)}.md`;
	// A bare page path with no file extension (e.g. "/blog/foo") is still a page.
	if (!/\.[a-z0-9]+$/i.test(pathname)) return `${pathname}.md`;
	return null; // an asset with an extension (.css, .png, .xml, …)
}
