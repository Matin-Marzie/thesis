from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dialogue import Dialogue, DialogueSentence
from app.models.reel import Reel
from app.models.sentence import Sentence, SentenceTranslation
from app.schemas.reel_creation import SubtitleLineIn


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

                for translation in line.translations:
                    translation_sentence_id = await self._find_or_create_sentence(
                        translation.translation_language_id, translation.text
                    )
                    await self._link_translation(sentence_id, translation_sentence_id)

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
