# Word of Wonders grid-generation benchmark

Drives the real, unmodified `frontend/components/games/WordOfWonders/LevelGenerator.js`
from Node (via `alias-loader.mjs`, which resolves its `@/` import alias) against
the real seeded dictionaries in `database/words/`, across simulated learner
vocabulary sizes and all three supported languages.

## Run

    WOW_FRONTEND_ROOT=/home/matin/ionian_university/thesis/frontend \
      node --experimental-loader ./alias-loader.mjs benchmark.mjs > results.csv

Then aggregate `results.csv` into `summary.csv` (see thesis Chapter 5 for the
aggregation snippet).

## Files
- `parse-dict.mjs` — parses the seeded SQL word-list dumps into `{id, written_form}` arrays.
- `benchmark.mjs` — runs N=200 trials per (language, vocabulary size), records words
  placed, board fill %, generation time, and due-word placement success.
- `results.csv` — raw per-trial output (3,600 trials).
- `summary.csv` — aggregated per-(language, vocabulary size) statistics.
