from typing import List, Optional

from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dialogue import Dialogue, DialogueSentence
from app.models.reel import Reel
from app.models.sentence import Sentence, SentenceTranslation
from app.schemas.reel_creation import SubtitleLineIn

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

                # Tokenizing (lemmatize + link sentence_tokens) doesn't happen
                # here - spaCy/Stanza/hazm are too heavy for this service's
                # 512MB host. scripts/reels/backfill_tokens.py does it
                # locally instead and refreshes sentences_json below's
                # 'tokens' arrays once it runs.
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
