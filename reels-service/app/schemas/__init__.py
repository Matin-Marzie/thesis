# Pydantic validates and converts data — it ensures incoming JSON has the right types/structure and automatically serializes Python objects to clean JSON responses, preventing invalid data from entering your app and exposing sensitive fields in your API.
# Pydantic of python <=analogy=> JOI for nodejs

# Pydantic schemas for API request/response
from app.schemas.language import LanguageResponse
from app.schemas.user import UserResponse, CreatorResponse
from app.schemas.word import WordResponse, TokenResponse
from app.schemas.sentence import SentenceResponse
from app.schemas.dialogue import DialogueResponse
from app.schemas.reel import (
    ReelResponse,
    ReelStatsResponse,
    UserInteractionResponse,
    ReelsListResponse,
)

__all__ = [
    "LanguageResponse",
    "UserResponse",
    "CreatorResponse",
    "WordResponse",
    "TokenResponse",
    "SentenceResponse",
    "DialogueResponse",
    "ReelResponse",
    "ReelStatsResponse",
    "UserInteractionResponse",
    "ReelsListResponse",
]
