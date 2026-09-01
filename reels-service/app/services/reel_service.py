from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from typing import List, Optional, Tuple

from app.models.reel import Reel, ReelInteraction
from app.models.language import Language
from app.models.dialogue import Dialogue
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

    async def build_dialogue_response(self, dialogue: Dialogue) -> DialogueResponse:
        """Build dialogue response from the precomputed sentences_json
        snapshot (see ReelCreationService.create_with_dialogue) - no query,
        since dialogue.sentences_json is already eager-loaded alongside the
        reel itself. Contains every sentence's full translation set (all
        languages, not just one) - the client picks the entry matching the
        viewer's native language."""
        sentences_json = dialogue.sentences_json or []
        sentences_response = [SentenceResponse.model_validate(s) for s in sentences_json]

        return DialogueResponse(
            id=dialogue.id,
            created_at=dialogue.created_at,
            sentences=sentences_response
        )

    async def get_reel_by_id(self, reel_id: int) -> Optional[Reel]:
        """Fetch a single reel with the same relationships get_random_reels
        eager-loads, so build_reel_response can be reused for it."""
        result = await self.db.execute(
            select(Reel)
            .options(
                joinedload(Reel.language),
                joinedload(Reel.creator),
                joinedload(Reel.dialogue)
            )
            .where(Reel.id == reel_id)
        )
        return result.unique().scalar_one_or_none()

    async def build_reel_response(self, reel: Reel, user_id: Optional[int] = None) -> ReelResponse:
        """Build the full ReelResponse (stats, creator, language, dialogue,
        user_interaction) for one reel - the per-reel body of
        get_random_reels, factored out so other endpoints (e.g. reel
        creation) can return the identical shape."""
        stats = await self.get_reel_stats(reel.id)

        creator_response = None
        if reel.creator:
            creator_response = CreatorResponse(
                id=reel.creator.id,
                username=reel.creator.username,
                profile_picture=reel.creator.profile_picture
            )

        language_response = None
        if reel.language:
            language_response = LanguageResponse(
                id=reel.language.id,
                code=reel.language.code,
                name=reel.language.name
            )

        dialogue_response = None
        if reel.dialogue:
            dialogue_response = await self.build_dialogue_response(reel.dialogue)

        interactions_by_reel = await self.get_reel_interactions_for_user(
            user_id, [reel.id]
        ) if user_id else {}
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

        return ReelResponse(
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

    async def get_reels_by_creator(
        self,
        creator_id: int,
        viewer_id: Optional[int] = None,
        limit: int = 30
    ) -> Tuple[List[ReelResponse], int]:
        """Get a user's own reels, most recent first, full shape - powers
        the profile 'My Reels' list. `viewer_id` is normally the same as
        `creator_id` here (a user viewing their own reels right after
        login), but is kept separate from `creator_id` since it's what
        build_reel_response uses to resolve user_interaction."""
        query = (
            select(Reel)
            .options(
                joinedload(Reel.language),
                joinedload(Reel.creator),
                joinedload(Reel.dialogue)
            )
            .where(Reel.created_by == creator_id)
            .order_by(Reel.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(query)
        reels = result.unique().scalars().all()

        count_result = await self.db.execute(
            select(func.count(Reel.id)).where(Reel.created_by == creator_id)
        )
        total = count_result.scalar() or 0

        reels_response = [
            await self.build_reel_response(reel, user_id=viewer_id)
            for reel in reels
        ]

        return reels_response, total

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
                dialogue_response = await self.build_dialogue_response(reel.dialogue)

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
