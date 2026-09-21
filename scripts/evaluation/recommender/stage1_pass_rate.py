"""
Stage 1 (ComprehensibilityFilter) pass-rate test: for each onboarding
proficiency level a learner can select (N, A1, A2, B1, B2, C1, C2), builds
the exact known_word_ids set the real registration path would seed, then
runs the real Stage 1 formula from reel_service.py's get_personalized_reels
against the real 56 Farsi reels - at both the shipped COMPREHENSIBILITY_THRESHOLD
(currently 0.5, temporarily lowered - see config.py) and the spec's 0.98
(Section~subsec:stage1_design).

Two registration paths are mirrored exactly (questions.tsx / userVocabularyModel.js):
  - N: no bulk proficiency seed at all (levelIndex == fromIndex == 0 -> {}).
    Instead, 4 fixed starter words are individually added as new/tracked
    (still countable for Stage 1, since get_known_word_ids is membership-only,
    independent of FSRS state): سلام, آب, بابا, چای.
  - A1..C2: every word whose *level* is strictly below the declared level
    (PROFICIENCY_LEVELS order) is seeded as pre-known.

Usage:
    python3 stage1_pass_rate.py
"""
import re
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from parse_dump import load_dialogues, load_reels  # noqa: E402

DB_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "database")
FARSI_DICT_PATH = os.path.join(DB_DIR, "words", "farsi", "dictionary.sql")
GLOSY_DATA_PATH = os.path.join(DB_DIR, "glosy_data.sql")

FARSI_LANGUAGE_ID = 3

# Mirrors userVocabularyModel.js's PROFICIENCY_LEVELS (EX excluded - not a
# selectable onboarding option, see ProficiencySlide.tsx's `levels` array).
PROFICIENCY_LEVELS = ["N", "A1", "A2", "B1", "B2", "C1", "C2"]

# questions.tsx's FARSI_STARTER_WORD_IDS - سلام, آب, بابا, چای.
FARSI_STARTER_WORD_IDS = {203488, 200000, 200047, 200347}

# reels-service/app/core/config.py's COMPREHENSIBILITY_THRESHOLD: the
# temporarily-lowered shipped value, and the spec's original 0.98
# (Section subsec:stage1_design).
THRESHOLDS = {"shipped (0.5)": 0.5, "spec (0.98)": 0.98}

# Same multi-row VALUES(...), tuple shape as database/words/*/dictionary.sql:
# (id, 'written_form', 'pos', NULL|'...', NULL|'...', language_id, 'level', NULL|'...')
_WORD_ROW_RE = re.compile(
    r"\((\d+),\s*'((?:[^'\\]|\\.)*)',\s*'([^']*)',\s*(?:NULL|'[^']*'),\s*"
    r"(?:NULL|'[^']*'),\s*(\d+),\s*'([^']*)',\s*(?:NULL|'[^']*')\)"
)


def load_word_levels(dict_path):
    """{word_id: level} for every word in one language's dictionary.sql."""
    text = open(dict_path, encoding="utf-8").read()
    return {int(wid): level for wid, _form, _pos, _lang, level in _WORD_ROW_RE.findall(text)}


def known_word_ids_for_level(level, word_levels):
    """Exactly mirrors questions.tsx + userVocabularyModel.addByProficiencyLevel
    for a Farsi learner declaring `level` at onboarding."""
    if level == "N":
        return set(FARSI_STARTER_WORD_IDS)

    level_index = PROFICIENCY_LEVELS.index(level)
    levels_below = set(PROFICIENCY_LEVELS[:level_index])  # exclusive of `level` itself
    return {wid for wid, lvl in word_levels.items() if lvl in levels_below}


def unique_word_ids(sentences_json):
    """Same logic as ReelService._unique_word_ids, applied directly to a
    parsed sentences_json list (no ORM object needed)."""
    word_ids = set()
    for sentence in sentences_json:
        for token in sentence.get("tokens") or []:
            wid = (token.get("word") or {}).get("id")
            if wid is not None:
                word_ids.add(wid)
    return word_ids


def main():
    word_levels = load_word_levels(FARSI_DICT_PATH)

    dump_text = open(GLOSY_DATA_PATH, encoding="utf-8").read()
    dialogues = load_dialogues(dump_text)
    reels = load_reels(dump_text)

    fa_reels = [r for r in reels if r["language_id"] == FARSI_LANGUAGE_ID]
    reel_word_ids = {
        r["id"]: unique_word_ids(dialogues.get(r["dialogue_id"], []))
        for r in fa_reels
    }

    zero_token_reels = [rid for rid, wids in reel_word_ids.items() if not wids]
    scoreable_reels = {rid: wids for rid, wids in reel_word_ids.items() if wids}

    print(f"Real Farsi reels: {len(fa_reels)} total, "
          f"{len(zero_token_reels)} with zero tokens (never scoreable), "
          f"{len(scoreable_reels)} scoreable\n")

    header = f"{'Level':<6}{'Known words':>12}" + "".join(f"{name:>18}" for name in THRESHOLDS)
    print(header)
    print("-" * len(header))

    for level in PROFICIENCY_LEVELS:
        known = known_word_ids_for_level(level, word_levels)
        row = f"{level:<6}{len(known):>12}"
        for name, threshold in THRESHOLDS.items():
            passing = 0
            for wids in scoreable_reels.values():
                coverage = len(wids & known) / len(wids)
                if coverage >= threshold:
                    passing += 1
            pct = passing / len(scoreable_reels) * 100 if scoreable_reels else 0.0
            row += f"{f'{passing}/{len(scoreable_reels)} ({pct:.1f}%)':>18}"
        print(row)


if __name__ == "__main__":
    main()
