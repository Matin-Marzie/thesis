from pydantic import BaseModel
from typing import Optional


class WordResponse(BaseModel):
    """Schema for word data in API responses."""
    
    id: int
    written_form: str
    part_of_speech: Optional[str] = None # Todo: part_of_speech has been move to sentence_tokens table and must be removed from here
    article: Optional[str] = None
    audio_url: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for sentence token data in API responses."""
    
    id: int
    position: int # "position" will be renamed to "order"
    part_of_speech: Optional[str] = None
    word: WordResponse
    # Farsi only - "مادر من" for "مادرم", when the root was reached by
    # stripping a possessive suffix (see scripts/reels/lemmatizer.py).
    # Display-only, not stored anywhere - merged directly into
    # dialogues.sentences_json by scripts/reels/backfill_tokens.py, which
    # does this service's tokenization offline (see
    # ReelCreationService.create_with_dialogue's comment).
    expanded: Optional[str] = None

    class Config:
        from_attributes = True
