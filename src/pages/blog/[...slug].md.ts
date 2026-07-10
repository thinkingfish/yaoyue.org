import type { APIContext } from "astro";
import { getCollection } from "astro:content";

import { postMarkdown } from "@/lib/agent-markdown";

// GET /blog/<slug>.md — Markdown twin of each post, carrying the raw
// Markdown source the post was authored in.
export async function getStaticPaths() {
	const posts = await getCollection("blog", ({ data }) => !data.draft);
	return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export async function GET({ props }: APIContext) {
	const { post } = props as { post: Awaited<ReturnType<typeof getCollection>>[number] };
	const md = postMarkdown({
		title: post.data.title,
		description: post.data.description,
		slug: post.id,
		body: post.body ?? "",
		pubDate: post.data.pubDate,
		updatedDate: post.data.updatedDate,
	});
	return new Response(md, {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}
