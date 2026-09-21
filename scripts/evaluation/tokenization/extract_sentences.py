"""
Extracts every real Farsi sentence text out of database/glosy_data.sql's
dialogues.sentences_json cache (no live Postgres needed), deduped by
sentence id. Reuses the SQL-tuple parser already written for the
recommender evaluation.
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "recommender"))
from parse_dump import load_dialogues  # noqa: E402

DUMP_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "database", "glosy_data.sql"
)


def load_farsi_sentences():
    """{sentence_id: text} for every distinct sentence appearing in any
    Farsi dialogue's cached sentences_json - regardless of whether it
    already has tokens, since this script re-tokenizes from scratch."""
    text = open(DUMP_PATH, encoding="utf-8").read()
    dialogues = load_dialogues(text)

    sentences = {}
    for sentences_json in dialogues.values():
        for sentence in sentences_json:
            sid = sentence.get("id")
            stext = (sentence.get("text") or "").strip()
            if sid is not None and stext:
                sentences[sid] = stext
    return sentences


if __name__ == "__main__":
    sentences = load_farsi_sentences()
    print(f"Distinct non-empty sentences across all cached dialogues: {len(sentences)}")
    for sid, text in list(sentences.items())[:5]:
        print(f"  {sid}: {text}")
