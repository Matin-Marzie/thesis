#!/usr/bin/env python3
"""
Periodic local job that does the NLP work reels-service can't afford to do
in-process (512MB host - see reel_creation_service.py's comment at the
sentence-loop). For every sentence that's used in a dialogue, has a
lemmatizer available for its language (en/el/fa - see lemmatizer.py), and
has no sentence_tokens rows yet, this:

  1. Lemmatizes the sentence text locally (spaCy/Stanza/hazm - heavy, so
     this only ever runs on a machine with RAM to spare).
  2. Inserts a sentence_tokens row for each lemma that matches an existing
     dictionary word (same match rule reel_creation_service.py used to
     apply per-request: diacritic-stripped, case-insensitive written_form
     comparison; no match -> skipped, never auto-creates a word).
  3. Refreshes dialogues.sentences_json for the dialogue (i.e. the reel)
     that owns a newly-tokenized sentence, plus any dialogue whose
     sentences_json is still NULL (covers dialogues created by the
     reel-creation scripts, which never populate it at all) - reels-service reads only this cached column, never the raw
     tables, so nothing shows up in the API until it's refreshed here.

Work is committed one dialogue (reel) at a time: each dialogue gets its own
transaction covering both its sentence_tokens inserts and its
sentences_json refresh, committed before moving to the next dialogue. This
means a run that dies partway (or a lemmatizer crash on one sentence) keeps
whatever earlier reels it already finished, instead of losing the whole
batch's work; a re-run just picks up where it left off, same as before.

Idempotent: a sentence with existing tokens is skipped, and a dialogue with
already-current sentences_json and no newly-tokenized sentences is left
untouched. Safe to run repeatedly, e.g. on a cron.

Usage:
    python backfill_tokens.py

Requires: the NLP packages in requirements.txt (spacy/stanza/hazm), plus
their one-time model downloads - see this directory's requirements.txt.
Config: copy scripts/.env.example to scripts/.env and fill in the DB values
(same file the other scripts/reels/*.py scripts use).
"""
import traceback

import psycopg2
from psycopg2.extras import Json

from lemmatizer import lemmatize
from db_config import load_config

# Same char range as lemmatizer.py's strip_diacritics - undoes it on the
# words side so e.g. "خواستن" (lemma) matches "خواستَن" (dictionary entry,
# stored with harakat).
_STRIP_DIACRITICS_SQL = r"[ً-ْٰ]"

# Every dialogue (reel) with at least one untokenized candidate sentence,
# plus every dialogue whose sentences_json cache has never been populated.
_DIALOGUES_NEEDING_WORK_SQL = """
    SELECT DISTINCT ds.dialogue_id
    FROM dialogue_sentences ds
    JOIN sentences s ON s.id = ds.sentence_id
    JOIN languages l ON l.id = s.language_id
    WHERE l.code IN ('en', 'el', 'fa')
      AND NOT EXISTS (SELECT 1 FROM sentence_tokens st WHERE st.sentence_id = s.id)
    UNION
    SELECT id FROM dialogues WHERE sentences_json IS NULL
"""

_CANDIDATE_SENTENCES_FOR_DIALOGUE_SQL = """
    SELECT DISTINCT s.id, s.language_id, l.code, s.text
    FROM sentences s
    JOIN languages l ON l.id = s.language_id
    JOIN dialogue_sentences ds ON ds.sentence_id = s.id
    WHERE ds.dialogue_id = %s
      AND l.code IN ('en', 'el', 'fa')
      AND NOT EXISTS (SELECT 1 FROM sentence_tokens st WHERE st.sentence_id = s.id)
"""

_MATCH_WORD_SQL = f"""
    SELECT id FROM words
    WHERE language_id = %s
      AND lower(regexp_replace(written_form, '{_STRIP_DIACRITICS_SQL}', '', 'g')) = %s
    ORDER BY id
    LIMIT 1
"""

# Ported from reel_creation_service.py's _DIALOGUE_SENTENCES_JSON_SQL - kept
# in lockstep with it (same jsonb_build_object keys, same COALESCEs) since
# reel_service.py parses this shape directly via model_validate.
_DIALOGUE_SENTENCES_JSON_SQL = """
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'position', ds.position,
        'start_time_ms', ds.start_time_ms,
        'end_time_ms', ds.end_time_ms,
        'text', s.text,
        'normalized_text', s.normalized_text,
        'translations', COALESCE((
          SELECT jsonb_agg(jsonb_build_object('language_code', tl.code, 'text', st.text))
          FROM sentence_translations str
          JOIN sentences st ON st.id = str.translation_sentence_id
          JOIN languages tl ON tl.id = st.language_id
          WHERE str.sentence_id = s.id
        ), '[]'::jsonb),
        'tokens', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', tok.id, 'position', tok.position, 'part_of_speech', tok.part_of_speech,
            'word', jsonb_build_object(
              'id', w.id, 'written_form', w.written_form, 'part_of_speech', w.part_of_speech,
              'article', w.article, 'audio_url', w.audio_url, 'image_url', w.image_url
            )
          ) ORDER BY tok.position)
          FROM sentence_tokens tok JOIN words w ON w.id = tok.word_id
          WHERE tok.sentence_id = s.id
        ), '[]'::jsonb)
      ) ORDER BY ds.position
    ), '[]'::jsonb) AS sentences_json
    FROM dialogue_sentences ds
    JOIN sentences s ON s.id = ds.sentence_id
    WHERE ds.dialogue_id = %s
"""


def get_dialogue_ids_needing_work(cur):
    cur.execute(_DIALOGUES_NEEDING_WORK_SQL)
    return [row[0] for row in cur.fetchall()]


def tokenize_dialogue_sentences(cur, dialogue_id):
    """Lemmatizes+links every untokenized sentence in this one dialogue.
    Returns (tokenized_sentence_count, token_count, expansions_by_sentence)
    - expansions_by_sentence is {sentence_id: {position: expanded_text}}
    for positions where hazm safely expanded a possessive-suffixed Farsi
    word (e.g. "کتابم" -> "کتاب من", see lemmatizer.py's
    _detect_possessive_expansion) AND the root matched a dictionary word -
    this is display-only, merged directly into dialogues.sentences_json by
    refresh_dialogue_sentences_json below, never stored as its own column
    (there's nowhere to attach it if the root didn't match, since
    sentence_tokens only ever has rows for matched positions)."""
    cur.execute(_CANDIDATE_SENTENCES_FOR_DIALOGUE_SQL, (dialogue_id,))
    candidates = cur.fetchall()

    tokenized_sentence_count = 0
    token_count = 0
    expansions_by_sentence = {}
    for sentence_id, language_id, language_code, sentence_text in candidates:
        print(f"  Tokenizing sentence {sentence_id} ({language_code}): {sentence_text}")
        lemma_tokens = lemmatize(sentence_text, language_code)
        if not lemma_tokens:
            continue

        matched_any = False
        for position, lemma_token in enumerate(lemma_tokens, start=1):
            cur.execute(_MATCH_WORD_SQL, (language_id, lemma_token.lemma))
            row = cur.fetchone()
            if row is None:
                continue
            word_id = row[0]
            cur.execute(
                """
                INSERT INTO sentence_tokens (sentence_id, word_id, position, part_of_speech)
                VALUES (%s, %s, %s, %s)
                """,
                (sentence_id, word_id, position, lemma_token.part_of_speech),
            )
            token_count += 1
            matched_any = True
            if lemma_token.expanded:
                expansions_by_sentence.setdefault(sentence_id, {})[position] = lemma_token.expanded

        if matched_any:
            tokenized_sentence_count += 1

    return tokenized_sentence_count, token_count, expansions_by_sentence


def refresh_dialogue_sentences_json(cur, dialogue_id, expansions_by_sentence):
    cur.execute(_DIALOGUE_SENTENCES_JSON_SQL, (dialogue_id,))
    sentences_json = cur.fetchone()[0]

    for sentence_obj in sentences_json:
        position_expansions = expansions_by_sentence.get(sentence_obj["id"])
        if not position_expansions:
            continue
        for token_obj in sentence_obj["tokens"]:
            expanded = position_expansions.get(token_obj["position"])
            if expanded:
                token_obj["expanded"] = expanded

    cur.execute(
        "UPDATE dialogues SET sentences_json = %s WHERE id = %s",
        (Json(sentences_json), dialogue_id),
    )


def process_dialogue(conn, dialogue_id):
    """Tokenizes and refreshes a single dialogue (reel) inside its own
    transaction, committing on success and rolling back on failure so one
    bad sentence can't take down the rest of the run."""
    with conn.cursor() as cur:
        tokenized_count, token_count, expansions_by_sentence = tokenize_dialogue_sentences(cur, dialogue_id)
        refresh_dialogue_sentences_json(cur, dialogue_id, expansions_by_sentence)
    conn.commit()
    return tokenized_count, token_count


def main():
    config = load_config()

    conn = psycopg2.connect(
        host=config["DB_HOST"], port=config["DB_PORT"], dbname=config["DB_NAME"],
        user=config["DB_USER"], password=config["DB_PASSWORD"],
    )
    try:
        with conn.cursor() as cur:
            dialogue_ids = get_dialogue_ids_needing_work(cur)
        conn.rollback()
        print(f"Found {len(dialogue_ids)} dialogue(s) (reel(s)) needing work")

        succeeded = 0
        failed = 0
        total_sentences = 0
        total_tokens = 0
        for i, dialogue_id in enumerate(dialogue_ids, start=1):
            print(f"[{i}/{len(dialogue_ids)}] dialogue {dialogue_id}")
            try:
                tokenized_count, token_count = process_dialogue(conn, dialogue_id)
            except Exception:
                conn.rollback()
                failed += 1
                print(f"  FAILED, rolled back this dialogue's transaction:")
                traceback.print_exc()
                continue
            succeeded += 1
            total_sentences += tokenized_count
            total_tokens += token_count
            print(f"  Committed: {tokenized_count} sentence(s) tokenized, {token_count} token(s) inserted")
    finally:
        conn.close()

    print(
        f"Done: {succeeded} dialogue(s) committed ({total_sentences} sentence(s), "
        f"{total_tokens} token(s)), {failed} dialogue(s) failed"
    )


if __name__ == "__main__":
    main()
