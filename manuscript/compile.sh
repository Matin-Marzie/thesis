#!/usr/bin/env bash
# Compile the thesis: lualatex → bibtex → lualatex × 2
# LuaLaTeX (rather than pdflatex) is required for fontspec/Liberation Serif.
# Run from the manuscript/ directory or from anywhere (script cd's automatically).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MAIN="thesis"

# Intermediate passes routinely "fail" (nonzero exit) on undefined
# references/citations that later passes resolve, so don't abort on those;
# only the final PDF's presence indicates real success.

echo "==> Pass 1: lualatex"
lualatex -interaction=nonstopmode "$MAIN.tex" || true

echo "==> BibTeX"
bibtex "$MAIN" || true

echo "==> Pass 2: lualatex"
lualatex -interaction=nonstopmode "$MAIN.tex" || true

echo "==> Pass 3: lualatex (resolves cross-references)"
lualatex -interaction=nonstopmode "$MAIN.tex" || true

echo ""
if [ -f "$MAIN.pdf" ]; then
  echo "Done. Output: $SCRIPT_DIR/$MAIN.pdf"
else
  echo "FAILED: no $MAIN.pdf was produced. See $MAIN.log for the fatal error."
  exit 1
fi
