"""
Grouped bar chart of Stage 1 pass rate per onboarding level, at the shipped
(0.5) and spec (0.98) comprehensibility thresholds. Reuses the functions in
stage1_pass_rate.py, so the numbers are exactly what that script prints.

    python3 plot_stage1.py
"""
import os
import sys

import matplotlib.pyplot as plt

sys.path.insert(0, os.path.dirname(__file__))
from parse_dump import load_dialogues, load_reels  # noqa: E402
from stage1_pass_rate import (  # noqa: E402
    FARSI_DICT_PATH, GLOSY_DATA_PATH, FARSI_LANGUAGE_ID, PROFICIENCY_LEVELS,
    THRESHOLDS, load_word_levels, known_word_ids_for_level, unique_word_ids,
)

word_levels = load_word_levels(FARSI_DICT_PATH)
dump_text = open(GLOSY_DATA_PATH, encoding="utf-8").read()
dialogues = load_dialogues(dump_text)
reels = [r for r in load_reels(dump_text) if r["language_id"] == FARSI_LANGUAGE_ID]

reel_word_ids = {r["id"]: unique_word_ids(dialogues.get(r["dialogue_id"], [])) for r in reels}
scoreable = [wids for wids in reel_word_ids.values() if wids]
n_zero = len(reel_word_ids) - len(scoreable)

pct = {name: [] for name in THRESHOLDS}
known_sizes = []
for level in PROFICIENCY_LEVELS:
    known = known_word_ids_for_level(level, word_levels)
    known_sizes.append(len(known))
    for name, threshold in THRESHOLDS.items():
        passing = sum(1 for wids in scoreable if len(wids & known) / len(wids) >= threshold)
        pct[name].append(passing / len(scoreable) * 100)

# 0.98 is the threshold the application uses; 0.5 is shown for comparison only.
ORDER = ["spec (0.98)", "shipped (0.5)"]
LABELS = {"spec (0.98)": "0.98 (used by the application)", "shipped (0.5)": "0.5 (comparison only)"}
colors = {"spec (0.98)": "#3B82F6", "shipped (0.5)": "#9CA3AF"}
x = list(range(len(PROFICIENCY_LEVELS)))
width = 0.38

fig, ax = plt.subplots(figsize=(9, 5.2))
for i, name in enumerate(ORDER):
    values = pct[name]
    offset = (i - 0.5) * width
    bars = ax.bar([xi + offset for xi in x], values, width, label=LABELS[name], color=colors[name])
    for bar, v in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, v + 1.2, f"{v:.0f}%", ha="center", va="bottom", fontsize=8)

ax.set_xticks(x)
ax.set_xticklabels([f"{lvl}\n({size:,} words)" for lvl, size in zip(PROFICIENCY_LEVELS, known_sizes)])
ax.set_ylim(0, 112)
ax.set_xlabel("Onboarding level selected (seeded known vocabulary)")
ax.set_ylabel("Reels passing Stage 1 (%)")
ax.set_title(f"Stage 1 pass rate by onboarding level ({len(scoreable)} scoreable Farsi reels; {n_zero} with zero tokens excluded)", fontsize=10)
ax.grid(True, axis="y", alpha=0.3)
ax.legend(loc="upper left")
fig.tight_layout()
fig.savefig("stage1_pass_rate.png", dpi=150)
print("saved stage1_pass_rate.png")
