#!/usr/bin/env bash
# Compile the thesis: pdflatex → bibtex → pdflatex × 2
# Run from the manuscript/ directory or from anywhere (script cd's automatically).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MAIN="thesis"

echo "==> Pass 1: pdflatex"
pdflatex -interaction=nonstopmode "$MAIN.tex"

echo "==> BibTeX"
bibtex "$MAIN"

echo "==> Pass 2: pdflatex"
pdflatex -interaction=nonstopmode "$MAIN.tex"

echo "==> Pass 3: pdflatex (resolves cross-references)"
pdflatex -interaction=nonstopmode "$MAIN.tex"

echo ""
echo "Done. Output: $SCRIPT_DIR/$MAIN.pdf"
