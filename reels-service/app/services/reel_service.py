from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional, Tuple

from app.models.reel import Reel, ReelInteraction
from app.models.language import Language
from app.models.dialogue import Dialogue, DialogueSentence
from app.models.sentence import Sentence, SentenceToken, SentenceTranslation
from app.schemas.reel import (
    ReelResponse,
    ReelStatsResponse,
    UserInteractionResponse,
    ReelsListResponse,
)
from app.schemas.language import LanguageResponse
from app.schemas.user import CreatorResponse
from app.schemas.dialogue import DialogueResponse
from app.schemas.sentence import SentenceResponse
from app.schemas.word import TokenResponse, WordResponse


class ReelService:
    """Service class for reel-related business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_language_by_code(self, code: str) -> Optional[Language]:
        """Get language by ISO code."""
        result = await self.db.execute(
            select(Language).where(Language.code == code)
        )
        return result.scalar_one_or_none()

    async def get_reel_stats(self, reel_id: int) -> ReelStatsResponse:
        """Calculate reel statistics from interactions."""
        # Count views
        views_result = await self.db.execute(
            select(func.count(ReelInteraction.id)).where(
                ReelInteraction.reel_id == reel_id
            )
        )
        views = views_result.scalar() or 0

        # Count likes
        likes_result = await self.db.execute(
            select(func.count(ReelInteraction.id)).where(
                and_(
                    ReelInteraction.reel_id == reel_id,
                    ReelInteraction.is_liked == True
                )
            )
        )
        likes = likes_result.scalar() or 0

        # Count comments
        comments_result = await self.db.execute(
            select(func.count(ReelInteraction.id)).where(
                and_(
                    ReelInteraction.reel_id == reel_id,
                    ReelInteraction.comment.isnot(None)
                )
            )
        )
        comments = comments_result.scalar() or 0

        # Count saves
        saves_result = await self.db.execute(
            select(func.count(ReelInteraction.id)).where(
                and_(
                    ReelInteraction.reel_id == reel_id,
                    ReelInteraction.is_saved == True
                )
            )
        )
        saves = saves_result.scalar() or 0

        return ReelStatsResponse(
            views=views,
            likes=likes,
            comments=comments,
            saves=saves
        )

    async def get_sentence_translation(
        self,
        sentence_id: int,
        native_language_id: int
    ) -> Optional[str]:
        """Get translation of a sentence in the native language."""
        # A sentence can have more than one translation_sentence in the same
        # language - e.g. two different reels each contributing their own
        # phrasing for the same original sentence - so this isn't guaranteed
        # to be unique. Pick one deterministically rather than assuming a
        # single match (scalar_one_or_none would raise MultipleResultsFound).
        result = await self.db.execute(
            select(Sentence.text)
            .join(
                SentenceTranslation,
                SentenceTranslation.translation_sentence_id == Sentence.id
            )
            .where(
                and_(
                    SentenceTranslation.sentence_id == sentence_id,
                    Sentence.language_id == native_language_id
                )
            )
            .order_by(Sentence.id)
            .limit(1)
        )
        translation = result.scalar()
        return translation

    async def build_dialogue_response(
        self,
        dialogue: Dialogue,
        native_language_id: int
    ) -> DialogueResponse:
        """Build dialogue response with sentences, tokens, and translations."""
        sentences_response = []

        # Get dialogue sentences with related data
        result = await self.db.execute(
            select(DialogueSentence)
            .options(
                joinedload(DialogueSentence.sentence).selectinload(Sentence.tokens).joinedload(SentenceToken.word)
            )
            .where(DialogueSentence.dialogue_id == dialogue.id)
            .order_by(DialogueSentence.position)
        )
        dialogue_sentences = result.unique().scalars().all()

        for ds in dialogue_sentences:
            sentence = ds.sentence
            
            # Get translation
            translation = await self.get_sentence_translation(
                sentence.id, 
                native_language_id
            )

            # Build tokens
            tokens_response = []
            for token in sorted(sentence.tokens, key=lambda t: t.position):
                word = token.word
                word_response = WordResponse(
                    id=word.id,
                    written_form=word.written_form,
                    part_of_speech=word.part_of_speech,
                    level=word.level,
                    article=word.article,
                    audio_url=word.audio_url,
                    image_url=word.image_url
                )
                tokens_response.append(TokenResponse(
                    id=token.id,
                    position=token.position,
                    part_of_speech=token.part_of_speech,
                    word=word_response
                ))

            sentences_response.append(SentenceResponse(
                id=sentence.id,
                position=ds.position,
                start_time_ms=ds.start_time_ms,
                end_time_ms=ds.end_time_ms,
                text=sentence.text,
                normalized_text=sentence.normalized_text,
                translation=translation,
                tokens=tokens_response
            ))

        return DialogueResponse(
            id=dialogue.id,
            created_at=dialogue.created_at,
            sentences=sentences_response
        )

    async def get_reel_interactions_for_user(
        self,
        user_id: int,
        reel_ids: List[int]
    ) -> dict:
        """Batch-fetch this user's interaction row for each of the given reels."""
        if not reel_ids:
            return {}

        result = await self.db.execute(
            select(ReelInteraction).where(
                and_(
                    ReelInteraction.user_id == user_id,
                    ReelInteraction.reel_id.in_(reel_ids)
                )
            )
        )
        return {interaction.reel_id: interaction for interaction in result.scalars().all()}

    async def get_random_reels(
        self,
        native_language_code: str,
        learning_language_code: str,
        limit: int = 10,
        user_id: Optional[int] = None
    ) -> Tuple[List[ReelResponse], int]:
        """
        Get random reels for the specified language pair.

        Args:
            native_language_code: ISO code for user's native language
            learning_language_code: ISO code for language being learned
            limit: Maximum number of reels to return
            user_id: Authenticated user's id, used to populate each reel's
                user_interaction (e.g. whether they already liked it)

        Returns:
            Tuple of (list of reels, total count)
        """
        # Get language IDs
        native_language = await self.get_language_by_code(native_language_code)
        learning_language = await self.get_language_by_code(learning_language_code)

        if not native_language or not learning_language:
            return [], 0

        # Query for reels in the learning language
        query = (
            select(Reel)
            .options(
                joinedload(Reel.language),
                joinedload(Reel.creator),
                joinedload(Reel.dialogue)
            )
            .where(Reel.language_id == learning_language.id)
            .order_by(func.random())
            .limit(limit)
        )

        result = await self.db.execute(query)
        reels = result.unique().scalars().all()

        # Get total count
        count_result = await self.db.execute(
            select(func.count(Reel.id)).where(Reel.language_id == learning_language.id)
        )
        total = count_result.scalar() or 0

        # Batch-fetch this user's like/save/etc. state for the returned reels
        # (one query for the whole page rather than one per reel).
        interactions_by_reel = await self.get_reel_interactions_for_user(
            user_id, [reel.id for reel in reels]
        ) if user_id else {}

        # Build response
        reels_response = []
        for reel in reels:
            # Get stats
            stats = await self.get_reel_stats(reel.id)

            # Build creator response
            creator_response = None
            if reel.creator:
                creator_response = CreatorResponse(
                    id=reel.creator.id,
                    username=reel.creator.username,
                    profile_picture=reel.creator.profile_picture
                )

            # Build language response
            language_response = None
            if reel.language:
                language_response = LanguageResponse(
                    id=reel.language.id,
                    code=reel.language.code,
                    name=reel.language.name
                )

            # Build dialogue response
            dialogue_response = None
            if reel.dialogue:
                dialogue_response = await self.build_dialogue_response(
                    reel.dialogue,
                    native_language.id
                )

            # Reflect this user's own like/save/etc. state, if any
            interaction = interactions_by_reel.get(reel.id)
            if interaction:
                user_interaction = UserInteractionResponse(
                    viewed_at=interaction.viewed_at,
                    is_liked=interaction.is_liked,
                    is_saved=interaction.is_saved,
                    is_shared=interaction.is_shared,
                    comment=interaction.comment
                )
            else:
                user_interaction = UserInteractionResponse()

            reels_response.append(ReelResponse(
                id=reel.id,
                url=reel.url,
                thumbnail_url=reel.thumbnail_url,
                title=reel.title,
                duration=reel.duration,
                created_at=reel.created_at,
                language=language_response,
                created_by=creator_response,
                stats=stats,
                user_interaction=user_interaction,
                dialogue=dialogue_response
            ))

        return reels_response, total
