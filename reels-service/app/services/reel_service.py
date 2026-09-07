import random
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from typing import List, Optional, Set, Tuple

from app.core.config import settings
from app.models.reel import Reel, ReelInteraction
from app.models.language import Language
from app.models.dialogue import Dialogue
from app.models.user_language import UserLanguage
from app.models.user_vocabulary import UserVocabulary
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

    async def build_reel_response(
        self,
        reel: Reel,
        user_id: Optional[int] = None,
        comprehensibility_percentage: Optional[float] = None,
    ) -> ReelResponse:
        """Build the full ReelResponse (stats, creator, language, dialogue,
        user_interaction) for one reel - the per-reel body of
        get_random_reels, factored out so other endpoints (e.g. reel
        creation) can return the identical shape. `comprehensibility_percentage`
        is only ever passed by get_personalized_reels (stage 1 of the
        recommendation engine's output)."""
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
            dialogue=dialogue_response,
            comprehensibility_percentage=comprehensibility_percentage
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

    async def get_user_languages_id(
        self,
        user_id: int,
        native_language_id: int,
        learning_language_id: int
    ) -> Optional[int]:
        """Resolve the user_languages row backing this (user, native,
        learning) pair - user_vocabulary is scoped by user_languages_id
        (not directly by language), mirroring the Node backend's
        userVocabularyModel."""
        result = await self.db.execute(
            select(UserLanguage.id).where(
                and_(
                    UserLanguage.user_id == user_id,
                    UserLanguage.native_language_id == native_language_id,
                    UserLanguage.learning_language_id == learning_language_id,
                )
            ).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_known_word_ids(self, user_languages_id: int) -> Set[int]:
        """All word ids in the user's vocabulary for one user_languages
        pair. Membership only - FSRS review state doesn't matter for
        comprehensibility, a word either has been introduced or hasn't."""
        result = await self.db.execute(
            select(UserVocabulary.word_id).where(
                UserVocabulary.user_languages_id == user_languages_id
            )
        )
        return set(result.scalars().all())

    async def get_due_word_ids(self, user_languages_id: int) -> Set[int]:
        """Word ids in the user's vocabulary whose FSRS next_review_at has
        already passed - i.e. due for review right now."""
        result = await self.db.execute(
            select(UserVocabulary.word_id).where(
                and_(
                    UserVocabulary.user_languages_id == user_languages_id,
                    UserVocabulary.next_review_at <= func.now(),
                )
            )
        )
        return set(result.scalars().all())

    @staticmethod
    def _unique_word_ids(reel: Reel) -> Set[int]:
        """Every distinct word id used across a reel's dialogue, read
        straight from the precomputed dialogue.sentences_json snapshot -
        no extra query needed."""
        if not reel.dialogue or not reel.dialogue.sentences_json:
            return set()

        word_ids: Set[int] = set()
        for sentence in reel.dialogue.sentences_json:
            for token in sentence.get("tokens") or []:
                word_id = (token.get("word") or {}).get("id")
                if word_id is not None:
                    word_ids.add(word_id)
        return word_ids

    async def get_personalized_reels(
        self,
        user_id: int,
        native_language_code: str,
        learning_language_code: str,
        limit: int = 10,
    ) -> Tuple[List[ReelResponse], int]:
        """
        Multistage recommendation engine.

        Stage 1 - ComprehensibilityFilter: a candidate reel passes only if
        at least settings.COMPREHENSIBILITY_THRESHOLD of its unique word
        tokens are already in the user's vocabulary for this language pair;
        the comprehensibility percentage is attached to each surviving reel
        for the frontend to display.

        Stage 2 - SpacedRepetitionPrioritizer: among stage 1's survivors,
        reels covering more words that are due for FSRS review right now
        (next_review_at already passed) are ranked first, so watching one
        doubles as review. This re-ranks stage 1's output, it doesn't
        filter it further - reels with no due words still fill out `limit`
        if there aren't enough "due" reels to go around. Skipped entirely
        (falls back to a random pick, like before) when the user has no
        words due for review right now.

        Falls back to get_random_reels when the user hasn't set up this
        language pair yet (nothing to filter on: no user_languages row to
        scope user_vocabulary by).

        Returns (reels, total_candidates_in_learning_language) - an empty
        reels list with total > 0 means the filter rejected every
        candidate (distinct from total == 0, meaning the language itself
        has no reels at all).
        """
        native_language = await self.get_language_by_code(native_language_code)
        learning_language = await self.get_language_by_code(learning_language_code)

        if not native_language or not learning_language:
            return [], 0

        user_languages_id = await self.get_user_languages_id(
            user_id, native_language.id, learning_language.id
        )
        if user_languages_id is None:
            return await self.get_random_reels(
                native_language_code, learning_language_code, limit, user_id
            )

        known_word_ids = await self.get_known_word_ids(user_languages_id)

        # Candidate pool: every reel in the learning language. The catalog
        # is tiny for now, so scoring the whole thing in Python is fine;
        # this should move to a SQL-side computation once it grows.
        candidates_result = await self.db.execute(
            select(Reel)
            .options(
                joinedload(Reel.language),
                joinedload(Reel.creator),
                joinedload(Reel.dialogue),
            )
            .where(Reel.language_id == learning_language.id)
        )
        candidates = candidates_result.unique().scalars().all()
        total = len(candidates)

        passing: List[Tuple[Reel, float, Set[int]]] = []
        for reel in candidates:
            reel_word_ids = self._unique_word_ids(reel)
            if not reel_word_ids:
                # No tokens to measure comprehension against - can't
                # confirm the reel is comprehensible, so it doesn't pass.
                continue
            comprehensibility = len(reel_word_ids & known_word_ids) / len(reel_word_ids)
            if comprehensibility >= settings.COMPREHENSIBILITY_THRESHOLD:
                passing.append((reel, comprehensibility, reel_word_ids))

        due_word_ids = await self.get_due_word_ids(user_languages_id)

        if due_word_ids:
            # Stage 2: rank by due-word coverage, random tiebreak within
            # equal coverage (shuffle before the stable sort).
            scored = [
                (reel, pct, len(reel_word_ids & due_word_ids))
                for reel, pct, reel_word_ids in passing
            ]
            random.shuffle(scored)
            scored.sort(key=lambda entry: entry[2], reverse=True)
            selection = [(reel, pct) for reel, pct, _ in scored[:limit]]
        else:
            # Nothing due for review - skip stage 2, random pick like before.
            selection = [
                (reel, pct) for reel, pct, _ in
                random.sample(passing, min(limit, len(passing)))
            ]

        reels_response = [
            await self.build_reel_response(
                reel, user_id=user_id, comprehensibility_percentage=round(pct * 100, 1)
            )
            for reel, pct in selection
        ]

        return reels_response, total
