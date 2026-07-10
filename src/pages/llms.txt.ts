// /llms.txt — a curated, Markdown map of this site for LLMs and AI agents,
// following the proposed spec at https://llmstxt.org/.
//
// Generated from the same content the site renders, so it never drifts:
//   H1 name → blockquote summary → prose → H2 "file list" sections.

import type { APIContext } from "astro";
import { getCollection } from "astro:content";

import { SITE } from "@/data/site";
import { podcastsInterviews, publicTalks } from "@/data/talks";

export async function GET(context: APIContext) {
	const site = context.site ?? new URL(`${SITE.url}/`);
	const abs = (path: string) => new URL(path, site).toString();

	const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
	);

	const year = (iso: string | Date) => new Date(iso).getUTCFullYear();

	const blogLines = posts.map((p) => {
		const note = p.data.description ?? `Published ${year(p.data.pubDate)}.`;
		return `- [${p.data.title}](${abs(`/blog/${p.id}/`)}): ${note}`;
	});

	const talkLines = publicTalks.map((t) => `- [${t.title}](${t.recordingUrl}): ${t.event}.`);

	const mediaLines = podcastsInterviews.map(
		(t) => `- [${t.title}](${t.recordingUrl}): ${t.event}.`,
	);

	const body = `# ${SITE.name}

> ${SITE.description}

Yao Yue is a San Francisco–based systems engineer and writer. This site collects her blog, public talks, podcasts, and links. She is known for work on distributed caching, performance engineering, and infrastructure at scale (including many years running caching at Twitter and the Pelikan cache project).

## About
- [Home & bio](${abs("/")}): who Yao is and where to find her online.
- [RSS feed](${abs("/rss.xml")}): new blog posts, talks, and interviews.

## Blog
${blogLines.join("\n")}

## Talks
${talkLines.join("\n")}

## Podcasts & interviews
${mediaLines.join("\n")}
`;

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
