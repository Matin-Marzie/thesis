"""
Plots the two retained WoW benchmark metrics from summary.csv, each as its
own saved PNG: words placed (cap = 12) and generation time, both vs.
simulated vocabulary size. Run after aggregate.js has produced summary.csv.

    python3 plot.py
"""
import csv
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

rows = list(csv.DictReader(open("summary.csv")))
langs = ["en", "el", "fa"]
colors = {"en": "#3B82F6", "el": "#F59E0B", "fa": "#10B981"}
labels = {"en": "English", "el": "Greek", "fa": "Farsi"}

# Vocabulary sizes actually tested (must match VOCAB_SIZES in benchmark.mjs).
vocab_sizes = [10, 100, 500, 1000, 3000, 6000, 10000]

def plot_metric(mean_field, std_field, title, ylabel, out_path):
    fig, ax = plt.subplots(figsize=(7.5, 5))
    for lang in langs:
        pts = sorted(
            (int(r["vocabSize"]), float(r[mean_field]), float(r[std_field]))
            for r in rows if r["lang"] == lang
        )
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        es = [p[2] for p in pts]
        ax.errorbar(xs, ys, yerr=es, marker="o", color=colors[lang], label=labels[lang], linewidth=2, capsize=3)

    ax.set_xscale("log")
    ax.set_xticks(vocab_sizes)
    ax.get_xaxis().set_major_formatter(mticker.ScalarFormatter())
    ax.set_xticklabels([str(v) for v in vocab_sizes])
    ax.minorticks_off()
    ax.set_xlabel("User vocabulary count (out of a ≤15,000-word dictionary)")
    ax.set_ylabel(ylabel)
    ax.set_title(f"{title} (±1 SD, N=200/point)")
    ax.grid(True, alpha=0.3)
    ax.legend()
    fig.tight_layout()
    fig.savefig(out_path, dpi=150)
    print(f"saved {out_path}")

plot_metric("meanWordsPlaced", "stdWordsPlaced",
            "Word of Wonders: mean words placed (cap = 12)", "Words placed on board",
            "words_placed_vs_vocab.png")

plot_metric("meanElapsedMs", "stdElapsedMs",
            "Word of Wonders: mean generation time", "Generation time (ms)",
            "generation_time_vs_vocab.png")
