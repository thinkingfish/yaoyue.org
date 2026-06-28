#!/usr/bin/env bash
# Build every Slidev talk in talks-src/<name>/ into public/talks/<name>/, with
# the correct subpath base. Astro then copies public/ -> dist/ verbatim, so the
# decks ship at https://yaoyue.org/talks/<name>/.
#
# Run this before committing whenever a talk's source changes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/talks-src"
OUT="$ROOT/public/talks"

for dir in "$SRC"/*/; do
  name="$(basename "$dir")"
  # Skip scaffolding dirs like _template
  case "$name" in _*) continue ;; esac
  echo "==> building talk: $name"
  (
    cd "$dir"
    [ -d node_modules ] || npm install
    rm -rf "$OUT/$name"
    npx slidev build --base "/talks/$name/" --out "$OUT/$name"
  )
done

echo "✓ talks built into public/talks/"
