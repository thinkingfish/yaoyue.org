---
theme: default
title: Your Talk Title
# routerMode: hash makes deep links (#/3) work with NO server redirects —
# required for hosting under a subpath like /talks/<name>/. Keep it.
routerMode: hash
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
