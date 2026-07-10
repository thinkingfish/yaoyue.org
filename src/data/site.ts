// Site-wide constants and stable schema.org @id anchors.
//
// The @id values are stable IRIs, NOT navigable URLs. Reusing the same
// `PERSON_ID` on every page (defined once on the home page, referenced
// everywhere else) lets AI engines and search knowledge graphs merge all
// mentions of Yao Yue into a single, unambiguous entity.

export const SITE = {
	url: "https://yaoyue.org",
	name: "Yao Yue",
	// One-line, factual identity statement used for the Person entity.
	description:
		"Yao Yue is a San Francisco–based systems engineer and writer. She writes about systems, software, and the people who build them, drawing on years of work on distributed caching, performance engineering, and infrastructure at scale.",
	// schema.org jobTitle accepts multiple values — wear as many hats as you like.
	jobTitle: ["CEO & Co-founder", "Software engineer"],
	// Topics Yao is known for — helps engines understand the entity's expertise.
	knowsAbout: [
		"Distributed systems",
		"Caching",
		"Performance engineering",
		"Site reliability engineering",
		"Software infrastructure",
	],
} as const;

// Stable entity identifiers (see note above).
export const PERSON_ID = `${SITE.url}/#person`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** Reference to the canonical Person entity, for use as `author`/`mainEntity`. */
export const personRef = { "@id": PERSON_ID };
