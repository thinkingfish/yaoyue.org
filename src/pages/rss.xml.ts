import rss, { type RSSFeedItem } from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

import { conferenceTalks, podcastsInterviews } from "@/data/talks";

export async function GET(context: APIContext) {
	const site = context.site ?? new URL("https://yaoyue.org/");

	const talkItems: RSSFeedItem[] = [...conferenceTalks, ...podcastsInterviews].map((talk) => ({
		title: talk.title,
		link: talk.recordingUrl,
		pubDate: new Date(talk.date),
		description: talk.event,
		categories: ["talks"],
	}));

	const blogPosts = await getCollection("blog", ({ data }) => !data.draft);
	const blogItems: RSSFeedItem[] = blogPosts.map((post) => ({
		title: post.data.title,
		link: new URL(`/blog/${post.id}/`, site).toString(),
		pubDate: post.data.pubDate,
		description: post.data.description,
		categories: ["blog"],
	}));

	const items = [...blogItems, ...talkItems].sort(
		(a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0),
	);

	return rss({
		title: "Yao Yue",
		description: "New blog posts, talks, podcasts, and interviews from Yao Yue.",
		site,
		items,
	});
}
