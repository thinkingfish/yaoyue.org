# Talks

Self-contained Slidev decks published under `https://yaoyue.org/talks/<name>/`.

Each `talks-src/<name>/` is an independent Slidev project. `scripts/build-talks.sh`
builds them into `public/talks/<name>/`, which Astro copies into `dist/` — so the
decks ship with the normal site build, no Cloudflare config change.

## Add a new talk

```sh
cp -R talks-src/_template talks-src/<name>      # _template is skipped by the builder
# write talks-src/<name>/slides.md, drop images in talks-src/<name>/public/
./scripts/build-talks.sh                        # builds all talks into public/talks/
git add talks-src/<name> public/talks/<name> && git commit && git push
```

Then add a row to `src/data/talks.ts` with `liveSlidesUrl: /talks/<name>/` to list it.

## Conventions (baked into the template)

- **`routerMode: hash`** in the headmatter — deep links (`#/3`) work with no server
  redirects, required for subpath hosting.
- **`<Img src="foo.png" />`** for every image (file in `public/`, no leading slash).
  Plain `<img src="/foo.png">` / `![](/foo.png)` break the build — Slidev tries to
  import the path and Vite's `server.fs.allow` rejects it.

`scripts/build-talks.sh` derives the base (`--base /talks/<name>/`) from the folder
name, so the folder name is the only thing that sets the URL. (The per-talk
`package.json` `build` script is just a convenience for `npm run build` in-dir —
the script is the source of truth.)
