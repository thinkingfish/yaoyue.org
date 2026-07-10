// Builders for schema.org JSON-LD. Kept framework-agnostic so pages/layouts
// can compose the objects and hand them to the <JsonLd /> component.
//
// Guiding principles (per the KDD 2024 GEO study and schema.org guidance):
//   - Only describe things that are actually visible on the page.
//   - Reuse a single stable Person @id everywhere so engines resolve one entity.
//   - Prefer explicit dates, authorship, and `sameAs` links for disambiguation.

import { ORG, PERSON_ID, personRef, SITE, WEBSITE_ID } from "@/data/site";

type Json = Record<string, unknown>;

/** The canonical WebSite entity — emitted site-wide. */
export function websiteSchema(): Json {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": WEBSITE_ID,
		url: `${SITE.url}/`,
		name: SITE.name,
		description: SITE.description,
		inLanguage: "en",
		publisher: personRef,
	};
}

/**
 * The canonical Person entity, wrapped in a ProfilePage.
 * Emitted once, on the home/bio page. `sameAs` is the key disambiguation
 * signal — pass every authoritative profile (GitHub, Scholar, LinkedIn, …).
 */
export function profilePageSchema(opts: {
	sameAs: string[];
	imageUrl?: string;
	description?: string;
}): Json {
	return {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		url: `${SITE.url}/`,
		mainEntity: {
			"@type": "Person",
			"@id": PERSON_ID,
			name: SITE.name,
			url: `${SITE.url}/`,
			jobTitle: SITE.jobTitle,
			description: opts.description ?? SITE.description,
			knowsAbout: SITE.knowsAbout,
			worksFor: {
				"@type": "Organization",
				"@id": ORG.id,
				name: ORG.name,
				url: ORG.url,
				sameAs: ORG.sameAs,
			},
			...(opts.imageUrl ? { image: opts.imageUrl } : {}),
			sameAs: opts.sameAs,
		},
	};
}

/** A blog post. Author references the shared Person @id rather than redefining it. */
export function blogPostingSchema(opts: {
	title: string;
	description?: string;
	url: string;
	datePublished: string;
	dateModified?: string;
	imageUrl?: string;
}): Json {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: opts.title,
		...(opts.description ? { description: opts.description } : {}),
		url: opts.url,
		mainEntityOfPage: opts.url,
		datePublished: opts.datePublished,
		dateModified: opts.dateModified ?? opts.datePublished,
		author: personRef,
		publisher: personRef,
		...(opts.imageUrl ? { image: opts.imageUrl } : {}),
		inLanguage: "en",
	};
}

/** Breadcrumb trail for nested pages. `items` are ordered [{ name, url }]. */
export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: item.name,
			item: item.url,
		})),
	};
}
