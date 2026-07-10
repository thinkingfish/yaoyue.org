---
name: seo-geo
description: Keep yaoyue.org optimized for search engines and AI answer engines (SEO/GEO). Invoke whenever adding or editing a page, blog post, talk, podcast, social link, or any routing / metadata / <head> change — before committing — to ensure structured data (JSON-LD), meta/OG/Twitter tags, robots.txt, llms.txt, the sitemap, and semantic HTML stay correct. Also use when someone asks to "check SEO", "improve discoverability", or "make sure AI can find/cite this".
---

# SEO / GEO guardrails for yaoyue.org

This site is optimized so both traditional search and AI answer engines
(ChatGPT, Claude, Perplexity, Google AI Overviews/Gemini) can **discover,
understand, and cite** it. The optimizations are wired into shared plumbing —
your job on each change is to **route new content through that plumbing** and
then **run the check**. Don't hand-roll `<head>` tags or JSON-LD per page.

Grounding for these rules: the peer-reviewed KDD 2024 GEO study (structured
data + answer-first prose + cited facts correlate with higher LLM citation),
official OpenAI/Anthropic crawler docs, schema.org, and the llms.txt spec.

## The plumbing (where things live)

| Concern                              | File                                       | Notes                                                                         |
| ------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------- |
| Site constants, stable entity `@id`s | `src/data/site.ts`                         | `SITE`, `PERSON_ID`, `WEBSITE_ID`, `personRef`                                |
| JSON-LD builders                     | `src/lib/structured-data.ts`               | `websiteSchema`, `profilePageSchema`, `blogPostingSchema`, `breadcrumbSchema` |
| JSON-LD renderer                     | `src/components/Seo/JsonLd.astro`          | escapes `<`, accepts one object or an array                                   |
| Meta / OG / Twitter                  | `src/components/Seo/Seo.astro`             | Twitter cards, author, article dates, fallback image                          |
| `<head>` wiring                      | `src/layouts/BaseHead.astro`               | emits site-wide `WebSite` + page `jsonLd`                                     |
| Layout props                         | `src/layouts/BaseLayout.astro`             | pass `title`, `description`, `image?`, `author?`, `article?`, `jsonLd?`       |
| AI/search crawler rules              | `public/robots.txt`                        | default-allow + correct `Sitemap:`                                            |
| LLM site map                         | `src/pages/llms.txt.ts`                    | generated from content; stays in sync automatically                           |
| XML sitemap                          | `@astrojs/sitemap` (in `astro.config.mjs`) | automatic                                                                     |
| RSS feed                             | `src/pages/rss.xml.ts`                     | blog + talks                                                                  |

## Non-negotiable invariants

1. **One Person, one `@id`.** Everything authored by Yao references
   `PERSON_ID` (`https://yaoyue.org/#person`). The full `Person` is defined
   **once**, on the home page, inside `ProfilePage`. Never redefine it
   elsewhere — reference it with `personRef`.
2. **`sameAs` stays populated.** The home page's `Person.sameAs` is built from
   the socials collection (minus `mailto:`). Adding an authoritative profile
   (ORCID, Wikidata, a new social) = add it to `src/data/socials/` and it
   flows through automatically.
3. **Every page has** a specific `<title>`, a non-empty **answer-first**
   `description`, a canonical URL, OG tags, and a Twitter card. These come free
   from `BaseLayout` — just pass a good `title` and `description`.
4. **Descriptions are answer-first and honest.** ~120–160 chars, lead with the
   direct point, no keyword stuffing (the GEO study found stuffing _hurts_).
   Never mark up facts that aren't visible on the page.
5. **robots.txt** must keep the correct `Sitemap:` line and never regress to a
   template domain.

## Playbooks

### Adding / editing a blog post

- Frontmatter **must** include a concise, answer-first `description` (used for
  the meta description, snippet, JSON-LD, and llms.txt). Keep `pubDate`; add
  `updatedDate` on a meaningful edit.
- Routing is already handled by `src/pages/blog/[...slug].astro`, which emits
  `BlogPosting` (authored by `PERSON_ID`) + `BreadcrumbList` and sets
  `og:type=article` with published/modified times. No per-post `<head>` work.
- Prefer semantic structure in the body: one topic per section, `##`/`###`
  headings phrased like questions/topics, descriptive link text, real
  cited facts/quotes, `<time>` for dates.

### Adding a talk or podcast

- Edit the tables in `src/data/talks.ts`. They automatically feed the Talks
  page, RSS, and `llms.txt`. Keep `date` as ISO `YYYY-MM-DD` and give an
  accurate `title`/`event`.

### Adding a new page/route

- Render it through `BaseLayout` with a real `title` + `description`.
- If it belongs in a hierarchy, pass a `breadcrumbSchema([...])` as `jsonLd`.
- If it represents a distinct entity type (e.g. an Event, a
  SoftwareSourceCode/Project, a Book), add a builder to
  `src/lib/structured-data.ts` rather than inlining JSON-LD, and reference
  `personRef` for authorship.

### Adding a social / authoritative profile

- Add a YAML file under `src/data/socials/`. It appears on the home page and
  in `Person.sameAs` automatically. This is the single highest-leverage GEO
  move for a person — prefer identity-grade profiles (GitHub, Scholar,
  LinkedIn, ORCID, Wikidata).

### Changing identity facts (name, title, bio)

- Edit `src/data/site.ts` (`SITE.description`, `SITE.jobTitle` — an array, so
  multiple roles are fine — `SITE.knowsAbout`). Keep it factual and in sync
  with the visible bio in `src/data/bio/index.md`.

## Verify before committing (required)

```bash
npm run build          # or: npx astro build
node scripts/check-seo.mjs
```

`scripts/check-seo.mjs` validates the built `dist/`: every content page has
title/description/canonical/OG/Twitter, all JSON-LD parses, the home page
carries WebSite+ProfilePage+Person with a non-empty `sameAs` and the stable
`@id`, every blog post has a `BlogPosting` authored by that `@id`, robots.txt
points at the real sitemap, llms.txt lists every post, and the sitemap lists
the core pages. It exits non-zero on any regression — fix, don't skip.

For deeper spot-checks, paste the built HTML's JSON-LD into Google's Rich
Results Test / Schema Markup Validator, and preview OG/Twitter cards.

## Don'ts

- Don't inline `<script type="application/ld+json">` or `<meta>` tags in pages —
  extend the shared components/builders instead.
- Don't redefine the `Person` entity anywhere but the home page.
- Don't add `Disallow` rules to `robots.txt` unless the user explicitly wants
  to opt out of AI training (they can — the search/index bots stay allowed).
- Don't invent facts (employers, awards, dates) in schema or descriptions.
