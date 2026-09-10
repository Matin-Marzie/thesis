from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.language import LanguageResponse
from app.schemas.user import CreatorResponse
from app.schemas.dialogue import DialogueResponse


class ReelStatsResponse(BaseModel):
    """Schema for reel statistics in API responses."""

    views: int = 0
    likes: int = 0
    comments: int = 0
    saves: int = 0


class ReviewWordResponse(BaseModel):
    """The single FSRS due word this reel doubles as review for (Stage 2's
    get_due_word_ids_fifo, assigned oldest-word-first to the first
    still-unclaimed reel that contains it). At most one review_word per
    reel, and at most one reel per due word - a personalized response can
    carry several of these across different reels in the same page, one
    per distinct due word it managed to cover."""

    id: int
    written_form: str


class UserInteractionResponse(BaseModel):
    """Schema for user interaction data in reel responses."""

    last_view_at: Optional[datetime] = None
    view_count: int = 0
    is_liked: bool = False
    is_saved: bool = False
    is_shared: bool = False
    comment: Optional[str] = None


class ReelResponse(BaseModel):
    """Schema for reel data in API responses."""
    
    id: int
    url: str
    thumbnail_url: Optional[str] = None
    title: Optional[str] = None
    duration: Optional[int] = None
    created_at: datetime
    language: Optional[LanguageResponse] = None
    created_by: Optional[CreatorResponse] = None
    stats: ReelStatsResponse
    user_interaction: Optional[UserInteractionResponse] = None
    dialogue: Optional[DialogueResponse] = None
    # Recommendation engine stage 1 (ComprehensibilityFilter) output: percent
    # (0-100) of this reel's unique word tokens already in the viewer's
    # vocabulary. Only populated for authenticated, personalized results.
    comprehensibility_percentage: Optional[float] = None
    # Stage 2 (SpacedRepetitionPrioritizer) output - see ReviewWordResponse.
    # A distinct due word per reel; several reels in the same personalized
    # response can each carry a different one.
    review_word: Optional[ReviewWordResponse] = None

    class Config:
        from_attributes = True


class ReelsListResponse(BaseModel):
    """Schema for list of reels in API responses."""

    reels: List[ReelResponse]
    total_reels_available_in_db_for_learning_language: int


class UserReelsListResponse(BaseModel):
    """Schema for a user's own reels - full shape (dialogue, stats,
    user_interaction included), used to power the profile 'My Reels' list
    right after login/register, since the Node backend's login/register
    payload only carries a few flat columns with no dialogue."""

    reels: List[ReelResponse]
    total: int
