import re
from typing import List, NamedTuple, Optional

# sentence_tokens.part_of_speech is VARCHAR(10) - short, consistent codes
# regardless of which library/tagset produced them.
_UPOS_MAP = {
    "NOUN": "noun", "PROPN": "noun", "VERB": "verb", "AUX": "verb",
    "ADJ": "adjective", "ADV": "adverb", "ADP": "prep", "DET": "determiner",
    "PRON": "pronoun", "CCONJ": "conj", "SCONJ": "conj", "NUM": "num",
    "PART": "particle", "INTJ": "interj",
}

_SPACY_MODEL_BY_LANGUAGE = {
    "en": "en_core_web_sm",
}

# Stanza's UD-based upos tags use the same tagset as spaCy's, so one map
# covers both.
_STANZA_MODEL_BY_LANGUAGE = {
    "el": "el",
}

# spaCy splits contractions into multiple linguistic tokens (e.g. "I'm" ->
# "I" + "'m"), but every other position scheme in this codebase - the
# frontend's word-by-word rendering, hazm's word_tokenize, manually-entered
# tokens - treats one whitespace-separated surface word as one position.
# These are the clitics spaCy's own .lemma_ doesn't already resolve to a
# natural surface form (it gives "be" for both "'m" and "'re" - the
# correct form depends on which clitic it is, not just the lemma).
# Clitics not listed here ("'ll" -> "will", "'ve" -> "have", "'d" ->
# "would", "n't"/"not") are already correct straight from .lemma_.
_CLITIC_EXPANSIONS = {
    "'m": "am",
    "'re": "are",
    "'s": "is",
}

# Arabic/Persian harakat (tashkeel, U+064B-U+0652) plus superscript alef
# (U+0670) - lemmatizer output is always undiacritized, but
# words.written_form is stored with full diacritics (e.g. "آتَش"), so both
# sides must be stripped before comparing.
_DIACRITICS_RE = re.compile("[ً-ْٰ]")


class LemmaToken(NamedTuple):
    lemma: str
    part_of_speech: Optional[str]


def strip_diacritics(text: str) -> str:
    return _DIACRITICS_RE.sub("", text)


_spacy_models = {}


def _get_spacy_model(model_name: str):
    # Lazy + cached: the first sentence in a given language pays the model
    # load cost once per process; every one after reuses it.
    if model_name not in _spacy_models:
        import spacy
        _spacy_models[model_name] = spacy.load(model_name)
    return _spacy_models[model_name]


def _group_spacy_tokens_by_surface_word(doc) -> List[list]:
    """Merges a contraction's sub-tokens back into one group per
    whitespace-separated surface word. A token only merges into the
    previous group when there was no space before it AND it looks like a
    contraction continuation (starts with an apostrophe, or is "n't") -
    trailing punctuation with no space before it (e.g. "sea.") must NOT
    merge, so punctuation is dropped rather than merged."""
    groups: List[list] = []
    prev_had_trailing_space = True
    for tok in doc:
        if tok.is_space:
            prev_had_trailing_space = True
            continue
        if tok.is_punct:
            prev_had_trailing_space = bool(tok.whitespace_)
            continue

        # Real subtitle text commonly uses a curly apostrophe (’)
        # instead of a straight one (').
        is_contraction_continuation = tok.text[:1] in ("'", "’") or tok.text.lower().lstrip("’") == "n't"
        if groups and not prev_had_trailing_space and is_contraction_continuation:
            groups[-1].append(tok)
        else:
            groups.append([tok])
        prev_had_trailing_space = bool(tok.whitespace_)
    return groups


def _lemmatize_spacy_group(group: list) -> "LemmaToken":
    if len(group) == 1:
        tok = group[0]
        # An empty lemma (rare) still produces one entry, not zero - the
        # caller must get exactly one LemmaToken per surface-word position,
        # with no positions silently dropped. An empty-string lemma simply
        # never matches a dictionary word, the same as any other lemma with
        # no match (see ReelCreationService._tokenize_sentence).
        lemma = strip_diacritics(tok.lemma_.strip().lower())
        return LemmaToken(lemma=lemma, part_of_speech=_UPOS_MAP.get(tok.pos_))

    # A contraction: "I'm" -> "i am", "don't" -> "do not" - a multi-word
    # phrase lemma, looked up in `words` the same way a single-word lemma
    # is (some dictionaries store fixed phrases too, e.g. part_of_speech
    # "phrase").
    parts = [
        _CLITIC_EXPANSIONS.get(tok.text.lower().replace("’", "'"), tok.lemma_.strip().lower())
        for tok in group
    ]
    return LemmaToken(lemma=strip_diacritics(" ".join(parts)), part_of_speech="phrase")


_stanza_pipelines = {}


def _get_stanza_pipeline(lang_code: str):
    # Lazy + cached, same as _get_spacy_model. stanza.Pipeline downloads
    # its model resources on first use if missing (pre-downloaded in
    # Docker builds instead, so this is a no-op there).
    if lang_code not in _stanza_pipelines:
        import stanza
        _stanza_pipelines[lang_code] = stanza.Pipeline(lang_code, processors="tokenize,pos,lemma", verbose=False)
    return _stanza_pipelines[lang_code]


def _lemmatize_stanza_token(tok) -> LemmaToken:
    # Stanza distinguishes surface tokens from the (possibly several)
    # dependency-tree "words" they expand to - e.g. Greek "στη" is one
    # token but two words ("σε" + "ο", roughly "to" + "the"). This is the
    # same shape of problem spaCy's English contractions caused, and the
    # same fix: one LemmaToken per token, joining multiple words into a
    # phrase rather than letting them consume separate positions.
    words = tok.words
    if len(words) == 1:
        w = words[0]
        lemma = strip_diacritics((w.lemma or w.text).strip().lower())
        # Every Greek definite article form (ο/η/το/της/τα/των/...)
        # lemmatizes to the same citation form "ο" regardless of its
        # actual gender/case/number - linking every occurrence to that one
        # generic dictionary entry isn't useful, so skip rather than match.
        if w.upos == "DET" and lemma == "ο":
            return LemmaToken(lemma="", part_of_speech=None)
        return LemmaToken(lemma=lemma, part_of_speech=_UPOS_MAP.get(w.upos))

    parts = [strip_diacritics((w.lemma or w.text).strip().lower()) for w in words]
    return LemmaToken(lemma=" ".join(parts), part_of_speech="phrase")


_hazm_normalizer = None
_hazm_lemmatizer = None


def _get_hazm():
    global _hazm_normalizer, _hazm_lemmatizer
    if _hazm_lemmatizer is None:
        from hazm import Lemmatizer, Normalizer
        _hazm_normalizer = Normalizer()
        _hazm_lemmatizer = Lemmatizer()
    return _hazm_normalizer, _hazm_lemmatizer


_hazm_informal_normalizer = None


def _get_hazm_informal():
    global _hazm_informal_normalizer
    if _hazm_informal_normalizer is None:
        from hazm import InformalNormalizer
        _hazm_informal_normalizer = InformalNormalizer()
    return _hazm_informal_normalizer


def _resolve_hazm_lemma(lemmatizer, informal_normalizer, tok: str) -> str:
    """Try the token as typed first. Only if hazm's Lemmatizer doesn't
    recognize it at all (returns it unchanged) do we try
    InformalNormalizer's first candidate instead - e.g. "میخوام" (typed
    without the standard half-space) isn't recognized directly, but
    InformalNormalizer corrects it to "می‌خواهم" first, which IS
    recognized. Trying the informal-normalized form unconditionally
    instead would also "fix" already-correctly-typed words into garbled
    nonsense (tested: "می‌خواستم" -> "می‌خواهستم", not a real word) - so
    this try-original-first order matters.
    """
    raw_lemma = lemmatizer.lemmatize(tok)
    if raw_lemma != tok:
        return raw_lemma

    candidates = informal_normalizer.normalize(tok)
    if len(candidates) == 1 and len(candidates[0]) == 1:
        first_candidate = candidates[0][0][0]
        if first_candidate != tok:
            return lemmatizer.lemmatize(first_candidate)

    return raw_lemma


def lemmatize(text: str, language_code: str) -> Optional[List[LemmaToken]]:
    """One LemmaToken per surface token, in sentence order.

    Returns None if `language_code` has no lemmatizer wired up - the
    caller should skip tokenization entirely for that sentence, not
    insert anything. Runs synchronous, CPU-bound model inference - call
    via asyncio.to_thread from async code.
    """
    if language_code in _SPACY_MODEL_BY_LANGUAGE:
        nlp = _get_spacy_model(_SPACY_MODEL_BY_LANGUAGE[language_code])
        doc = nlp(text)
        groups = _group_spacy_tokens_by_surface_word(doc)
        return [_lemmatize_spacy_group(group) for group in groups]

    if language_code in _STANZA_MODEL_BY_LANGUAGE:
        nlp = _get_stanza_pipeline(_STANZA_MODEL_BY_LANGUAGE[language_code])
        doc = nlp(text)
        return [
            _lemmatize_stanza_token(tok)
            for sent in doc.sentences
            for tok in sent.tokens
            if not (len(tok.words) == 1 and tok.words[0].upos == "PUNCT")
        ]

    if language_code == "fa":
        normalizer, lemmatizer = _get_hazm()
        informal_normalizer = _get_hazm_informal()
        from hazm import word_tokenize

        tokens = word_tokenize(normalizer.normalize(text))
        result = []
        for tok in tokens:
            raw_lemma = _resolve_hazm_lemma(lemmatizer, informal_normalizer, tok)
            if "#" in raw_lemma:
                # hazm returns "pastRoot#presentRoot" for recognized verbs
                # (e.g. "رفت#رو" for می‌روم) - the dictionary stores
                # infinitives, which are simply pastRoot + "ن".
                lemma = raw_lemma.split("#", 1)[0] + "ن"
                pos = "verb"
            else:
                lemma = raw_lemma
                pos = None
            result.append(LemmaToken(lemma=strip_diacritics(lemma).lower(), part_of_speech=pos))
        return result

    return None
