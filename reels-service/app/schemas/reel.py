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


class UserInteractionResponse(BaseModel):
    """Schema for user interaction data in reel responses."""
    
    viewed_at: Optional[datetime] = None
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
    description: Optional[str] = None
    duration: Optional[int] = None
    created_at: datetime
    language: Optional[LanguageResponse] = None
    created_by: Optional[CreatorResponse] = None
    stats: ReelStatsResponse
    user_interaction: Optional[UserInteractionResponse] = None
    dialogue: Optional[DialogueResponse] = None

    class Config:
        from_attributes = True


class ReelsListResponse(BaseModel):
    """Schema for list of reels in API responses."""
    
    reels: List[ReelResponse]
    total_reels_available_in_db_for_learning_language: int
