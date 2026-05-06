import { file, glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const bioCollection = defineCollection({
	loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/bio" }),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			theme: z.enum(["dark", "light"]),
			blur: z.enum(["no blur", "blur"]),
			avatar: image(),
			background: image(),
		}),
});

const socialsCollection = defineCollection({
	loader: glob({ pattern: "**/[^_]*.{yml,yaml}", base: "./src/data/socials" }),
	schema: z.object({
		title: z.string(),
		hint: z.string().optional(),
		url: z.string(),
		order: z.number(),
		icon: z.enum([
			"github",
			"twitter",
			"bluesky",
			"mastodon",
			"linkedin",
			"instagram",
			"threads",
			"facebook",
			"youtube",
			"twitch",
			"tiktok",
			"snapchat",
			"reddit",
			"pinterest",
			"medium",
			"dev",
			"dribbble",
			"behance",
			"codepen",
			"producthunt",
			"discord",
			"slack",
			"whatsapp",
			"telegram",
			"email",
			"scholar",
		]),
	}),
});

const linksCollection = defineCollection({
	loader: glob({ pattern: "**/[^_]*.{yml,yaml}", base: "./src/data/links" }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		url: z.string(),
		order: z.number(),
	}),
});

const blogCollection = defineCollection({
	loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/data/blog" }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		draft: z.boolean().default(false),
	}),
});

export const collections = {
	socials: socialsCollection,
	bio: bioCollection,
	links: linksCollection,
	blog: blogCollection,
};
