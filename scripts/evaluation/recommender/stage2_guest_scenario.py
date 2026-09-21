"""
Stage 2 scenario: a brand-new, unregistered (guest) Farsi learner who picked
level N at onboarding. questions.tsx adds four starter words to the local
vocabulary - سَلام, آب, بابا, چای - each as a brand-new FSRS card whose
next_review_at is "now", so all four are due immediately (getDueWords).
ReelsContext.fetchReels forwards them as due_word_ids, and for a guest the
server runs get_random_reels: Stage 2 only (no comprehensibility filter, no
content ranking) via _rank_candidates_by_due_words, then _attach_review_words.

Uses the real ReelService static methods, unmodified, on the real 56 Farsi
reels parsed from database/glosy_data.sql. The catalogue was built so that
reels containing these four words exist.

    python3 stage2_guest_scenario.py
"""
import os
import random
import sys
from types import SimpleNamespace

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "reels-service"))

from parse_dump import load_dialogues, load_reels  # noqa: E402
from app.services.reel_service import ReelService  # noqa: E402

GLOSY_DATA_PATH = os.path.join(HERE, "..", "..", "..", "database", "glosy_data.sql")
FARSI_LANGUAGE_ID = 3
PAGE_SIZE = 10        # frontend/constants/Reels.js REELS_LIMIT
REPS = 2000

# questions.tsx FARSI_STARTER_WORD_IDS, in insertion (= FIFO due) order.
STARTER = [(203488, "سَلام"), (200000, "آب"), (200047, "بابا"), (200347, "چای")]
DUE_FIFO = [wid for wid, _ in STARTER]
DUE_SET = set(DUE_FIFO)


def main():
    text = open(GLOSY_DATA_PATH, encoding="utf-8").read()
    dialogues = load_dialogues(text)
    reels = [
        SimpleNamespace(id=r["id"], dialogue=SimpleNamespace(sentences_json=dialogues.get(r["dialogue_id"], [])))
        for r in load_reels(text) if r["language_id"] == FARSI_LANGUAGE_ID
    ]
    words = {r.id: ReelService._unique_word_ids(r) for r in reels}
    n = len(reels)

    print(f"Catalogue: {n} Farsi reels\n")
    print("Starter word coverage in the catalogue:")
    for wid, form in STARTER:
        k = sum(1 for w in words.values() if wid in w)
        print(f"  {form:<6} (id {wid}): in {k}/{n} reels")
    with_any = [rid for rid, w in words.items() if w & DUE_SET]
    print(f"  at least one starter word: {len(with_any)}/{n} reels "
          f"(base rate {len(with_any) / n * 100:.1f}% of a random page)\n")

    # Real Stage 2 guest path, repeated because ties are broken randomly.
    contain, attached, distinct_words, pages_with_prompt = [], [], [], 0
    control_contain = []
    for _ in range(REPS):
        page = ReelService._rank_candidates_by_due_words(list(reels), DUE_SET, PAGE_SIZE)
        responses = [SimpleNamespace(review_word=None) for _ in page]
        ReelService._attach_review_words(page, responses, DUE_FIFO)
        contain.append(sum(1 for r in page if words[r.id] & DUE_SET))
        got = [resp.review_word.id for resp in responses if resp.review_word]
        attached.append(len(got))
        distinct_words.append(len(set(got)))
        assert len(got) == len(set(got)), "a due word was attached to two reels"
        pages_with_prompt += 1 if got else 0
        # Control: same page size, no due words (random pick).
        ctrl = random.sample(reels, min(PAGE_SIZE, n))
        control_contain.append(sum(1 for r in ctrl if words[r.id] & DUE_SET))

    mean = lambda xs: sum(xs) / len(xs)
    print(f"Guest, level N, page of {PAGE_SIZE}, {REPS} repetitions:")
    print(f"  reels on the page containing a due word : {mean(contain):.2f}  (control, no due words: {mean(control_contain):.2f})")
    print(f"  review prompts attached per page        : {mean(attached):.2f} of {len(DUE_FIFO)} due words")
    print(f"  pages with at least one review prompt   : {pages_with_prompt / REPS * 100:.1f}%")
    print(f"  pages where all four words got a prompt : {sum(1 for d in distinct_words if d == len(DUE_FIFO)) / REPS * 100:.1f}%")


if __name__ == "__main__":
    main()
