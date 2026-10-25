#!/usr/bin/env bash
# Build the deployable static output without test scripts or development documentation.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/dist"
rm -rf "$OUT"
mkdir -p "$OUT"
cp "$ROOT/index.html" "$ROOT/about.html" "$ROOT/privacy.html" "$ROOT/404.html" "$ROOT/sitemap.xml" "$ROOT/robots.txt" "$ROOT/_headers" "$ROOT/favicon.svg" "$ROOT/og-preview.png" "$OUT/"
cp -R "$ROOT/src" "$ROOT/assets" "$ROOT/occasions" "$ROOT/hi" "$ROOT/gu" "$OUT/"
printf 'Static deployment output ready: %s\n' "$OUT"
