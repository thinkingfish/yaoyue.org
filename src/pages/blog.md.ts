import type { APIContext } from "astro";
import { getCollection } from "astro:content";

import { blogIndexMarkdown } from "@/lib/agent-markdown";

// GET /blog.md — Markdown twin of the blog index (/blog/).
export async function GET(_context: APIContext) {
	const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
	);
	const md = blogIndexMarkdown(
		posts.map((p) => ({
			title: p.data.title,
			slug: p.id,
			description: p.data.description,
			pubDate: p.data.pubDate,
		})),
	);
	return new Response(md, {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}
