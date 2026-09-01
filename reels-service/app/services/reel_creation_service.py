import asyncio
from typing import List, Optional

from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dialogue import Dialogue, DialogueSentence
from app.models.language import Language
from app.models.reel import Reel
from app.models.sentence import Sentence, SentenceToken, SentenceTranslation
from app.models.word import Word
from app.schemas.reel_creation import SubtitleLineIn
from app.services.lemmatizer import lemmatize

# Undoes lemmatizer output's diacritic stripping on the words side too, so
# "خواستن" (lemma) matches "خواستَن" (dictionary entry, stored with
# harakat) - see app/services/lemmatizer.py's strip_diacritics.
_STRIP_DIACRITICS_SQL = r"[ً-ْٰ]"

# Builds the entire sentence list for a dialogue - text, every available
# translation across all languages (not just one - the client picks the
# one matching the viewer's native language), and tokens/words - as one
# JSONB array, for caching onto dialogues.sentences_json at creation time.
# jsonb_build_object's keys are named to match
# SentenceResponse/SentenceTranslationResponse/TokenResponse/WordResponse
# exactly, so reel_service.py parses the cached array directly via
# model_validate with no manual mapping.
_DIALOGUE_SENTENCES_JSON_SQL = text("""
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
    WHERE ds.dialogue_id = :dialogue_id
""")


class ReelCreationService:
    """Port of backend/models/reelModel.js's createWithDialogue: one
    all-or-nothing transaction for dialogue + N sentences (subtitle
    language, reused when identical text already exists) + N
    dialogue_sentences (the ms-precise timing rows) + optional translation
    sentences/links + the reels row itself."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _find_or_create_sentence(self, language_id: int, text: str) -> int:
        existing = await self.db.execute(
            select(Sentence.id)
            .where(Sentence.language_id == language_id, Sentence.text == text)
            .limit(1)
        )
        sentence_id = existing.scalar_one_or_none()
        if sentence_id is not None:
            return sentence_id

        sentence = Sentence(language_id=language_id, text=text)
        self.db.add(sentence)
        await self.db.flush()
        return sentence.id

    # Two different lines can end up resolving to the identical
    # (sentence_id, translation_sentence_id) pair, so the link may already
    # exist - that's a no-op, not an error.
    async def _link_translation(self, sentence_id: int, translation_sentence_id: int) -> None:
        stmt = (
            pg_insert(SentenceTranslation)
            .values(sentence_id=sentence_id, translation_sentence_id=translation_sentence_id)
            .on_conflict_do_nothing(index_elements=["sentence_id", "translation_sentence_id"])
        )
        await self.db.execute(stmt)

    # Best-effort: lemmatizes `text` (spaCy for en/el, hazm for fa - see
    # lemmatizer.py) and, for each token whose lemma matches an existing
    # dictionary word, inserts a sentence_tokens row linking to it. A lemma
    # with no dictionary match is skipped entirely - nothing is created for
    # that position, per design (no auto-creating new words from
    # automatically-derived lemmas, which can be wrong for colloquial
    # forms - see lemmatizer.py's hazm notes). Idempotent: does nothing if
    # this sentence already has tokens (a reused sentence from an earlier
    # reel, or tokens added by hand).
    async def _tokenize_sentence(self, sentence_id: int, language_id: int, language_code: str, sentence_text: str) -> None:
        already_tokenized = await self.db.execute(
            select(func.count()).select_from(SentenceToken).where(SentenceToken.sentence_id == sentence_id)
        )
        if already_tokenized.scalar():
            return

        lemma_tokens = await asyncio.to_thread(lemmatize, sentence_text, language_code)
        if not lemma_tokens:
            return

        for position, lemma_token in enumerate(lemma_tokens, start=1):
            # Diacritic-stripped comparison can match more than one dictionary
            # row (near-duplicate entries differing only by vocalization) -
            # order by id so the choice is at least deterministic rather than
            # whatever the query planner happens to return first.
            matched_word = await self.db.execute(
                select(Word.id)
                .where(
                    Word.language_id == language_id,
                    func.lower(func.regexp_replace(Word.written_form, _STRIP_DIACRITICS_SQL, "", "g")) == lemma_token.lemma,
                )
                .order_by(Word.id)
                .limit(1)
            )
            word_id = matched_word.scalar_one_or_none()
            if word_id is None:
                continue

            self.db.add(SentenceToken(
                sentence_id=sentence_id,
                word_id=word_id,
                position=position,
                part_of_speech=lemma_token.part_of_speech,
            ))

    async def create_with_dialogue(
        self,
        created_by: int,
        url: str,
        thumbnail_url: Optional[str],
        title: Optional[str],
        language_id: int,
        duration: int,
        lines: List[SubtitleLineIn],
    ) -> Reel:
        try:
            language = await self.db.get(Language, language_id)
            language_code = language.code if language else None

            dialogue = Dialogue(language_id=language_id)
            self.db.add(dialogue)
            await self.db.flush()

            # `lines` order is authoritative for position (1-based) - any
            # client-supplied `position` is ignored so the
            # dialogue_sentences(dialogue_id, position) unique constraint can
            # never be violated by out-of-order/duplicate client input.
            for index, line in enumerate(lines):
                sentence_id = await self._find_or_create_sentence(language_id, line.text)

                self.db.add(
                    DialogueSentence(
                        dialogue_id=dialogue.id,
                        sentence_id=sentence_id,
                        position=index + 1,
                        start_time_ms=line.start_time_ms,
                        end_time_ms=line.end_time_ms,
                    )
                )

                if language_code:
                    await self._tokenize_sentence(sentence_id, language_id, language_code, line.text)

                for translation in line.translations:
                    translation_sentence_id = await self._find_or_create_sentence(
                        translation.translation_language_id, translation.text
                    )
                    await self._link_translation(sentence_id, translation_sentence_id)

            # Flush so the dialogue_sentences/sentence_translations rows just
            # added above are visible to the raw SQL aggregation below (this
            # session has autoflush disabled).
            await self.db.flush()
            sentences_json_result = await self.db.execute(
                _DIALOGUE_SENTENCES_JSON_SQL, {"dialogue_id": dialogue.id}
            )
            dialogue.sentences_json = sentences_json_result.scalar() or []

            reel = Reel(
                language_id=language_id,
                dialogue_id=dialogue.id,
                created_by=created_by,
                url=url,
                thumbnail_url=thumbnail_url,
                title=title,
                duration=duration,
            )
            self.db.add(reel)
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        await self.db.refresh(reel)
        return reel
