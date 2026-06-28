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
