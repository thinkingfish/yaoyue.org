---
name: seo-geo
description: Keep yaoyue.org optimized for search engines, AI answer engines, and agents (SEO/GEO/agent-readiness). Invoke whenever adding or editing a page, blog post, talk, podcast, social link, or any routing / metadata / <head> / robots.txt change — before committing — to keep structured data (JSON-LD), meta/OG/Twitter tags, robots.txt + Content Signals, llms.txt, the Markdown-for-agents twins, the sitemap, and semantic HTML correct. Also use when someone asks to "check SEO", "improve discoverability", "make the site agent-ready", "make AI able to find/cite this", or pastes an agent-readiness scan (e.g. isitagentready.com) to triage.
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

| Concern                              | File                                                                         | Notes                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Site constants, stable entity `@id`s | `src/data/site.ts`                                                           | `SITE`, `PERSON_ID`, `WEBSITE_ID`, `personRef`                                |
| JSON-LD builders                     | `src/lib/structured-data.ts`                                                 | `websiteSchema`, `profilePageSchema`, `blogPostingSchema`, `breadcrumbSchema` |
| JSON-LD renderer                     | `src/components/Seo/JsonLd.astro`                                            | escapes `<`, accepts one object or an array                                   |
| Meta / OG / Twitter                  | `src/components/Seo/Seo.astro`                                               | Twitter cards, author, article dates, fallback image                          |
| `<head>` wiring                      | `src/layouts/BaseHead.astro`                                                 | emits site-wide `WebSite` + page `jsonLd`                                     |
| Layout props                         | `src/layouts/BaseLayout.astro`                                               | pass `title`, `description`, `image?`, `author?`, `article?`, `jsonLd?`       |
| AI/search crawler rules              | `public/robots.txt`                                                          | default-allow + correct `Sitemap:` + `Content-Signal` usage prefs             |
| LLM site map                         | `src/pages/llms.txt.ts`                                                      | generated from content; stays in sync automatically                           |
| Markdown for agents (render)         | `src/lib/agent-markdown.ts`                                                  | builds `.md` from source; `markdownPathFor()` maps page URL → `.md`           |
| Markdown twins (endpoints)           | `src/pages/index.md.ts`, `blog.md.ts`, `blog/[...slug].md.ts`, `talks.md.ts` | emit `.md` at build                                                           |
| Markdown negotiation (runtime)       | `functions/_middleware.js`                                                   | serves `.md` at same URL on `Accept: text/markdown`                           |
| XML sitemap                          | `@astrojs/sitemap` (in `astro.config.mjs`)                                   | automatic                                                                     |
| RSS feed                             | `src/pages/rss.xml.ts`                                                       | blog + talks                                                                  |

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
5. **robots.txt** must keep the correct `Sitemap:` line, the `Content-Signal`
   directive (all three of `ai-train`/`search`/`ai-input`), and never regress
   to a template domain. Current posture: citable, not for training
   (`ai-train=no`, `search=yes`, `ai-input=yes`). Crawling stays allowed —
   Content Signals is a _usage preference_, not an access block.
6. **Every content page has a Markdown twin.** Agents that send
   `Accept: text/markdown` get Markdown at the same URL (via
   `functions/_middleware.js`), served from the pre-built `.md` files. New
   page types need a matching `.md` endpoint or they silently fall back to
   HTML. Keep `markdownPathFor()` identical in `src/lib/agent-markdown.ts` and
   `functions/_middleware.js`.

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
- Add a Markdown twin: an `.md` endpoint (see `src/pages/*.md.ts`) that a
  `GET` returns as `text/markdown`, so `markdownPathFor(newPath)` resolves to
  a real file. A `<link rel="alternate" type="text/markdown">` is emitted
  automatically by `BaseHead`. Without the twin the page just serves HTML to
  agents (graceful, but not ideal).

### Adding a social / authoritative profile

- Add a YAML file under `src/data/socials/`. It appears on the home page and
  in `Person.sameAs` automatically. This is the single highest-leverage GEO
  move for a person — prefer identity-grade profiles (GitHub, Scholar,
  LinkedIn, ORCID, Wikidata).

### Changing identity facts (name, title, bio)

- Edit `src/data/site.ts` (`SITE.description`, `SITE.jobTitle` — an array, so
  multiple roles are fine — `SITE.knowsAbout`, and `ORG` for `worksFor`). Keep
  it factual and in sync with the visible bio in `src/data/bio/index.md`.

### Changing AI-usage / crawler policy

- Edit the `Content-Signal` line in `public/robots.txt` to change how AI may
  _use_ the content (`ai-train` / `search` / `ai-input`, each `yes`/`no`).
  Current posture: `ai-train=no, search=yes, ai-input=yes`.
- Content Signals is a _preference_, not enforcement. For hard enforcement of
  "no training," additionally `Disallow` the training-only crawlers (GPTBot,
  ClaudeBot, CCBot, Google-Extended, Applebot-Extended) while leaving the
  search/index and user-fetch bots allowed — but only if the user asks.

## Verify before committing (required)

```bash
npm run check:seo      # = astro build && node scripts/check-seo.mjs
```

`scripts/check-seo.mjs` validates the built `dist/`: every content page has
title/description/canonical/OG/Twitter and a Markdown twin; all JSON-LD
parses; the home page carries WebSite+ProfilePage+Person with a non-empty
`sameAs` and the stable `@id`; every blog post has a `BlogPosting` authored by
that `@id`; robots.txt points at the real sitemap and carries the
`Content-Signal` directive; llms.txt lists every post; the sitemap lists the
core pages; and `functions/_middleware.js` exists. It exits non-zero on any
regression — fix, don't skip.

To exercise the Markdown negotiation locally (the one thing the static build
can't prove), run `npx wrangler pages dev dist` and check:

```bash
curl -H 'Accept: text/markdown' http://127.0.0.1:8788/blog/<slug>/   # → markdown
curl -H 'Accept: text/html'     http://127.0.0.1:8788/blog/<slug>/   # → HTML
```

For deeper spot-checks, paste the built HTML's JSON-LD into Google's Rich
Results Test / Schema Markup Validator, and preview OG/Twitter cards.

## Don'ts

- Don't inline `<script type="application/ld+json">` or `<meta>` tags in pages —
  extend the shared components/builders instead.
- Don't redefine the `Person` entity anywhere but the home page.
- Don't add `Disallow` rules to `robots.txt` unless the user explicitly wants
  to opt out of AI training (they can — the search/index bots stay allowed).
- Don't invent facts (employers, awards, dates) in schema or descriptions.
- **Don't fabricate agent-readiness metadata.** "Agent readiness" scanners
  (e.g. isitagentready.com) reward publishing API catalogs (RFC 9727),
  OAuth/OIDC discovery, OAuth protected-resource metadata, `auth.md`, MCP
  Server Cards, agent-skills indexes, DNS-AID records, and WebMCP tools. This
  is a static personal site with **no APIs, auth, or MCP server** — publishing
  any of that would advertise infrastructure that doesn't exist and mislead
  agents. Only add such a file when the capability it describes is real. (If a
  future page genuinely gains an API/auth surface, revisit.) The honest,
  applicable agent items are already done: Content Signals and Markdown for
  agents.
