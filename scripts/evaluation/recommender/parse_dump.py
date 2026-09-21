"""
Parses the real seeded data directly out of database/glosy_data.sql (no live
Postgres needed): languages, reels (id, language_id, dialogue_id), and
dialogues (id, sentences_json). This mirrors the WoW benchmark's approach of
driving real evaluation code with real seeded content read straight from the
SQL dump rather than a re-derived sample.
"""
import json
import re


def _split_sql_tuple(s):
    """Splits one `VALUES (...)` tuple's inner text on top-level commas,
    respecting single-quoted string literals (where '' is an escaped
    literal quote, not the string's end) and NULL/number literals."""
    parts = []
    buf = []
    in_string = False
    i = 0
    n = len(s)
    while i < n:
        c = s[i]
        if in_string:
            if c == "'":
                if i + 1 < n and s[i + 1] == "'":
                    buf.append("'")
                    i += 2
                    continue
                in_string = False
                buf.append(c)
                i += 1
                continue
            buf.append(c)
            i += 1
            continue
        else:
            if c == "'":
                in_string = True
                buf.append(c)
                i += 1
                continue
            if c == ",":
                parts.append("".join(buf))
                buf = []
                i += 1
                continue
            buf.append(c)
            i += 1
    parts.append("".join(buf))
    return [p.strip() for p in parts]


def _unquote(field):
    field = field.strip()
    if field == "NULL":
        return None
    if field.startswith("'") and field.endswith("'"):
        return field[1:-1].replace("''", "'")
    return field


def parse_insert_rows(sql_text, table_name):
    """Yields the VALUES tuple (as a list of raw field strings) for every
    single-row INSERT INTO public.<table_name> (...) VALUES (...); line."""
    prefix = f"INSERT INTO public.{table_name} ("
    for line in sql_text.splitlines():
        if not line.startswith(prefix):
            continue
        values_idx = line.index(" VALUES (")
        inner = line[values_idx + len(" VALUES ("):]
        # Strip the trailing ");" (allow optional whitespace before it).
        inner = inner.rstrip()
        assert inner.endswith(");"), f"unexpected line ending: {line[-20:]!r}"
        inner = inner[:-2]
        yield _split_sql_tuple(inner)


def load_languages(sql_text):
    """{language_id: code}"""
    out = {}
    for row in parse_insert_rows(sql_text, "languages"):
        lang_id, name, code = row
        out[int(_unquote(lang_id))] = _unquote(code)
    return out


def load_dialogues(sql_text):
    """{dialogue_id: sentences_json (parsed list)}"""
    out = {}
    for row in parse_insert_rows(sql_text, "dialogues"):
        dlg_id, language_id, created_at, sentences_json = row
        raw = _unquote(sentences_json)
        out[int(_unquote(dlg_id))] = json.loads(raw) if raw else []
    return out


def load_reels(sql_text):
    """List of dicts: {id, language_id, dialogue_id, title, duration}"""
    out = []
    for row in parse_insert_rows(sql_text, "reels"):
        reel_id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at = row
        out.append({
            "id": int(_unquote(reel_id)),
            "language_id": int(_unquote(language_id)),
            "dialogue_id": int(_unquote(dialogue_id)) if _unquote(dialogue_id) is not None else None,
            "title": _unquote(title),
            "duration": int(_unquote(duration)) if _unquote(duration) is not None else None,
        })
    return out


if __name__ == "__main__":
    text = open("/home/matin/ionian_university/thesis/database/glosy_data.sql", encoding="utf-8").read()
    langs = load_languages(text)
    dialogues = load_dialogues(text)
    reels = load_reels(text)
    print("languages:", langs)
    print("total reels:", len(reels))
    from collections import Counter
    print("reels per language_id:", Counter(r["language_id"] for r in reels))
    print("total dialogues:", len(dialogues))
    # Sanity check: word-id extraction on one real reel
    sample = reels[0]
    dlg = dialogues.get(sample["dialogue_id"], [])
    word_ids = set()
    for sentence in dlg:
        for token in sentence.get("tokens") or []:
            wid = (token.get("word") or {}).get("id")
            if wid is not None:
                word_ids.add(wid)
    print("sample reel", sample["id"], "unique word ids:", len(word_ids))
