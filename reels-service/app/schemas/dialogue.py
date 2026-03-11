from pydantic import BaseModel
from datetime import datetime
from typing import List
from app.schemas.sentence import SentenceResponse


class DialogueResponse(BaseModel):
    """Schema for dialogue data in API responses."""
    
    id: int
    created_at: datetime
    sentences: List[SentenceResponse] = []

    class Config:
        from_attributes = True
