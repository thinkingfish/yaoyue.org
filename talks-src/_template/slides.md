---
theme: default
title: Your Talk Title
# Default (history) routing -> clean URLs like /talks/<name>/3. Deep-link/refresh
# works because scripts/build-talks.sh writes an SPA fallback to public/_redirects.
mdc: true
class: text-center
---

# Your Talk Title

Subtitle or byline

<!--
ASSET RULE (important):
  Reference every image with  <Img src="foo.png" />  — file lives in public/,
  NO leading slash. The <Img> component prepends the deploy base so it works at
  /talks/<name>/.  Plain <img src="/foo.png"> or ![](/foo.png) will BREAK the
  build (Slidev tries to import the path and Vite rejects it).
-->

---

# A slide with an image

<Img src="example.png" alt="example" style="width:60%; margin:0 auto;" />

---

# Global styles

Edit styles/index.css for the deck-wide design system (Slidev auto-loads it).

<!--
Reusable pieces already in styles/index.css (see the caching and craft decks for live examples):
  .title-slide / .byline          opening slide
  .divider + .kicker (+ .q)       chapter divider; .q for an epigraph
  .statement                      one centered, large, light, italic line under an h1
  .cards / .card / .head / .label / .name / .secondary   card grids (.c2 / .c3 for columns)
  .cols2 (+ .big)                 two plain text columns, no outline; .big = h1 per column
  ul.rlist                        bullet list sized like .reveal lines
  .eyebrow (+ .section) / .takeaway (+ .big) / .accent   KEY TAKEAWAY blocks
  .punchline                      one centered line that lands the slide (wrap the key word in .accent)
  .callout (+ .warn) / .quote + .who                     left-rule callout / pull quote
  .figure + .caption (+ .legend)  titleless image or inline-chart slide, description at the bottom
  .flow / .node / .arrow          boxed nodes joined by arrows
  .chart + text.tick/.axis/.dl    inline-SVG chart text classes
  .orange / .muted / a.inherit    colour modifiers; link that inherits its parent colour
-->
