# Word of Wonders grid-generation benchmark

Drives the real, unmodified `frontend/components/games/WordOfWonders/LevelGenerator.js`
from Node (via `alias-loader.mjs`, which resolves its `@/` import alias) against
the real seeded dictionaries in `database/words/`, across simulated learner
vocabulary sizes and all three supported languages.

## Run

    WOW_FRONTEND_ROOT=/home/matin/ionian_university/thesis/frontend \
      node --experimental-loader ./alias-loader.mjs benchmark.mjs > results.csv

Then aggregate `results.csv` into `summary.csv`, and plot the two figures:

    node aggregate.js
    python3 plot.py

## Files
- `parse-dict.mjs` — parses the seeded SQL word-list dumps into `{id, written_form}` arrays.
- `benchmark.mjs` — runs N=200 trials per (language, vocabulary size), records words
  placed, board fill %, generation time, and due-word placement success.
- `aggregate.js` — aggregates `results.csv` into `summary.csv`.
- `plot.py` — plots words placed and generation time vs. vocabulary size from `summary.csv`
  (`words_placed_vs_vocab.png`, `generation_time_vs_vocab.png`).
- `results.csv` — raw per-trial output (4,200 trials: 3 languages × 7 vocabulary sizes × 200 repetitions).
- `summary.csv` — aggregated per-(language, vocabulary size) statistics.
