from pydantic import BaseModel
from typing import List, Optional
from app.schemas.word import TokenResponse


class SentenceResponse(BaseModel):
    """Schema for sentence data in API responses."""
    
    id: int
    position: int
    start_time_ms: Optional[int] = None
    end_time_ms: Optional[int] = None
    text: str
    normalized_text: Optional[str] = None
    translation: Optional[str] = None
    tokens: List[TokenResponse] = []

    class Config:
        from_attributes = True
