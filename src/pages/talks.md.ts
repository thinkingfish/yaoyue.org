import type { APIContext } from "astro";

import { podcastsInterviews, publicTalks } from "@/data/talks";
import { talksMarkdown } from "@/lib/agent-markdown";

// GET /talks.md — Markdown twin of the talks page (/talks/).
export async function GET(_context: APIContext) {
	const md = talksMarkdown(publicTalks, podcastsInterviews);
	return new Response(md, {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}
