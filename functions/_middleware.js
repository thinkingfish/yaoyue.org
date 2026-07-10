// Cloudflare Pages Function: Markdown content negotiation.
//
// When an agent requests a page with `Accept: text/markdown`, serve the
// pre-built Markdown twin (generated at build time by the src/pages/*.md.ts
// endpoints) at the SAME canonical URL. Browsers, which don't send that
// Accept type, keep getting HTML. No HTML→Markdown conversion happens here —
// we just hand back the Markdown we already generated from source.
//
// This mirrors `markdownPathFor()` in src/lib/agent-markdown.ts. Keep the two
// in sync (the SEO check asserts the .md files exist).

function markdownPathFor(pathname) {
	if (pathname.endsWith(".md")) return null; // already Markdown
	if (pathname === "/") return "/index.md";
	if (pathname.endsWith("/")) return `${pathname.slice(0, -1)}.md`;
	if (!/\.[a-z0-9]+$/i.test(pathname)) return `${pathname}.md`;
	return null; // an asset with an extension
}

function wantsMarkdown(accept) {
	// Honor an explicit `text/markdown` in the Accept header. Ignore the
	// wildcard "*/*" that browsers send so HTML stays the default.
	return /(^|,|\s)text\/markdown\b/i.test(accept || "");
}

export async function onRequest(context) {
	const { request, next } = context;

	if (request.method !== "GET" && request.method !== "HEAD") return next();
	if (!wantsMarkdown(request.headers.get("Accept"))) return next();

	const url = new URL(request.url);
	const mdPath = markdownPathFor(url.pathname);
	if (!mdPath) return next();

	// Fetch the companion .md static asset.
	const assetResp = await next(new Request(new URL(mdPath, url.origin), request));
	if (!assetResp.ok) return next(); // no twin → fall back to HTML

	const body = await assetResp.text();
	const headers = new Headers({
		"Content-Type": "text/markdown; charset=utf-8",
		// Rough token estimate (~4 chars/token) as an agent hint.
		"X-Markdown-Tokens": String(Math.ceil(body.length / 4)),
		"Cache-Control": "public, max-age=3600",
		// Same URL varies by Accept — tell caches so.
		Vary: "Accept",
	});
	return new Response(body, { status: 200, headers });
}
