from pydantic import BaseModel
from typing import List, Optional
from app.schemas.word import TokenResponse


class SentenceTranslationResponse(BaseModel):
    """One available translation of a sentence, in a specific language.
    The client picks the entry matching the viewer's native language -
    the backend caches all of them, not just one, so the same cached
    dialogue serves every native language."""

    language_code: str
    text: str

    class Config:
        from_attributes = True


class SentenceResponse(BaseModel):
    """Schema for sentence data in API responses."""

    id: int
    position: int
    start_time_ms: Optional[int] = None
    end_time_ms: Optional[int] = None
    text: str
    normalized_text: Optional[str] = None
    translations: List[SentenceTranslationResponse] = []
    tokens: List[TokenResponse] = []

    class Config:
        from_attributes = True
