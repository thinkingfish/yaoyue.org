import type { APIContext } from "astro";
import { getCollection } from "astro:content";

import { homeMarkdown } from "@/lib/agent-markdown";

// GET /index.md — Markdown twin of the home/bio page.
export async function GET(_context: APIContext) {
	const bio = await getCollection("bio");
	const profile = bio[0];
	const md = homeMarkdown({
		name: profile.data.name,
		bioBody: profile.body ?? "",
	});
	return new Response(md, {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}
