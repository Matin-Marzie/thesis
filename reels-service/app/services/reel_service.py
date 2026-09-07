import random
from collections import Counter
import numpy as np
from sklearn.feature_extraction import DictVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from typing import Dict, List, Optional, Set, Tuple

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

    # Stage 3 (ContentBasedRanker) implicit-feedback weights: every
    # reel_interactions row implies at least a view (BASE_VIEW_WEIGHT),
    # stacked with one bonus per engagement signal present on that row.
    BASE_VIEW_WEIGHT = 0.2
    LIKE_WEIGHT = 1.0
    SAVE_WEIGHT = 1.5
    SHARE_WEIGHT = 1.0
    COMMENT_WEIGHT = 1.5

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
                last_view_at=interaction.last_view_at,
                view_count=interaction.view_count,
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
                    last_view_at=interaction.last_view_at,
                    view_count=interaction.view_count,
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

    @staticmethod
    def _word_id_counts(reel: Reel) -> Counter:
        """Every word id used across a reel's dialogue, counted by
        occurrence (not deduped like _unique_word_ids) - the term-frequency
        input for stage 3's TF-IDF content vectors."""
        counts: Counter = Counter()
        if not reel.dialogue or not reel.dialogue.sentences_json:
            return counts
        for sentence in reel.dialogue.sentences_json:
            for token in sentence.get("tokens") or []:
                word_id = (token.get("word") or {}).get("id")
                if word_id is not None:
                    counts[word_id] += 1
        return counts

    @staticmethod
    def _build_content_vectors(reels: List[Reel]) -> Tuple[Optional[object], Dict[int, int]]:
        """Stage 3 (ContentBasedRanker) content representation: each reel's
        dialogue reduced to a bag of word ids, TF-IDF weighted across the
        given reel pool. Reuses the same structured word-id data as stages
        1/2 instead of raw multilingual text, so no extra NLP/tokenization
        is needed. Returns (tfidf_matrix, {reel_id: row_index}) -
        (None, {}) if no reel in `reels` has any tokens yet."""
        word_counts = [
            {str(word_id): count for word_id, count in ReelService._word_id_counts(reel).items()}
            for reel in reels
        ]
        if not any(word_counts):
            return None, {}

        count_matrix = DictVectorizer().fit_transform(word_counts)
        tfidf_matrix = TfidfTransformer().fit_transform(count_matrix)
        row_index = {reel.id: i for i, reel in enumerate(reels)}
        return tfidf_matrix, row_index

    async def get_interaction_weights(self, user_id: int, reel_ids: List[int]) -> Dict[int, float]:
        """Stage 3's implicit-feedback weight per reel this user has
        interacted with, restricted to `reel_ids` (scoped by the caller to
        the current learning language - word-id content vectors aren't
        comparable across languages)."""
        if not reel_ids:
            return {}

        result = await self.db.execute(
            select(ReelInteraction).where(
                and_(
                    ReelInteraction.user_id == user_id,
                    ReelInteraction.reel_id.in_(reel_ids),
                )
            )
        )

        weights: Dict[int, float] = {}
        for interaction in result.scalars().all():
            weight = self.BASE_VIEW_WEIGHT
            if interaction.is_liked:
                weight += self.LIKE_WEIGHT
            if interaction.is_saved:
                weight += self.SAVE_WEIGHT
            if interaction.is_shared:
                weight += self.SHARE_WEIGHT
            if interaction.comment is not None:
                weight += self.COMMENT_WEIGHT
            weights[interaction.reel_id] = weight
        return weights

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
        if there aren't enough "due" reels to go around.

        Stage 3 - ContentBasedRanker: within equal stage 2 due-word
        coverage, reels whose content (word-id TF-IDF vector) is more
        similar to the reels this user has previously engaged with
        (reel_interactions, weighted by BASE_VIEW_WEIGHT/LIKE_WEIGHT/etc.)
        are ranked first - the classic content-based recommendation
        approach ("more like the things you engaged with").

        Both stage 2 and stage 3 are re-ranks over the same stage 1
        survivors, applied as a single sort key: (due_word_coverage,
        content_similarity), most-important first, random tiebreak after
        both. Either signal degrades to a constant 0 for every candidate
        when it has nothing to work with (no due words; no interaction
        history yet to build a profile from), which makes that half of the
        sort key a no-op - so the whole ranking falls back to the original
        random pick when neither stage has any signal at all.

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

        # Stage 3 setup: TF-IDF content vectors for the whole candidate
        # pool (not just stage 1's survivors, so IDF stats reflect the
        # full corpus), then the user's profile vector - a weighted
        # average of the vectors of reels they've positively interacted
        # with in this same learning language.
        content_matrix, content_row_index = self._build_content_vectors(candidates)
        profile_vector = None
        if content_matrix is not None:
            interaction_weights = await self.get_interaction_weights(
                user_id, [reel.id for reel in candidates]
            )
            rows = [
                content_row_index[reel_id]
                for reel_id in interaction_weights
                if reel_id in content_row_index
            ]
            weights = [
                weight
                for reel_id, weight in interaction_weights.items()
                if reel_id in content_row_index
            ]
            if rows:
                weighted_rows = content_matrix[rows].multiply(np.array(weights).reshape(-1, 1))
                profile_vector = np.asarray(weighted_rows.sum(axis=0))

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

        # Stage 3 content-similarity scores, batched in one call over all
        # of stage 1's survivors rather than one call per reel.
        similarities = [0.0] * len(passing)
        if profile_vector is not None:
            row_indices = [content_row_index.get(reel.id) for reel, _, _ in passing]
            valid = [(i, idx) for i, idx in enumerate(row_indices) if idx is not None]
            if valid:
                sims = cosine_similarity(profile_vector, content_matrix[[idx for _, idx in valid]])[0]
                for (i, _), sim in zip(valid, sims):
                    similarities[i] = float(sim)

        due_word_ids = await self.get_due_word_ids(user_languages_id)

        if due_word_ids or profile_vector is not None:
            # Stages 2+3: sort by (due-word coverage, content similarity),
            # random tiebreak when both are equal (shuffle before the
            # stable sort). Either component is a constant 0 across every
            # entry when that stage has no signal, making it a no-op.
            scored = [
                (reel, pct, len(reel_word_ids & due_word_ids), sim)
                for (reel, pct, reel_word_ids), sim in zip(passing, similarities)
            ]
            random.shuffle(scored)
            scored.sort(key=lambda entry: (entry[2], entry[3]), reverse=True)
            selection = [(reel, pct) for reel, pct, _, _ in scored[:limit]]
        else:
            # Nothing to rank on - random pick, same as before stage 2/3.
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
