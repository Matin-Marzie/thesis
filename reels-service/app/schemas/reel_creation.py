from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas.reel import ReelResponse

# Mirrors backend/validation/CreateReelSchema.js's limits exactly, since both
# services write into the same reels/dialogues/sentences tables.
MAX_DURATION_SECONDS = 90
MAX_TITLE_LENGTH = 100
MAX_LINE_TEXT_LENGTH = 500
MAX_LINES = 200


class FileMeta(BaseModel):
    fileName: str
    contentType: str
    size: float


class PresignUploadsRequest(BaseModel):
    video: FileMeta
    thumbnail: Optional[FileMeta] = None


class PresignedFile(BaseModel):
    key: str
    url: str


class PresignUploadsResponse(BaseModel):
    video: PresignedFile
    thumbnail: Optional[PresignedFile] = None


class TranslationIn(BaseModel):
    """A line may carry zero or more translations, each tagged with its own
    language - e.g. one English line with both a Greek and a Farsi
    translation, so viewers of either native language see it in their own."""

    text: str = Field(min_length=1, max_length=MAX_LINE_TEXT_LENGTH)
    translation_language_id: int

    @field_validator("text")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("translation text cannot be empty")
        return value


class SubtitleLineIn(BaseModel):
    """Mirrors the DB's dialogue_sentences "valid_time" CHECK constraint
    (end_time_ms > start_time_ms) - this flow always supplies both."""

    position: int = Field(ge=1)
    text: str = Field(min_length=1, max_length=MAX_LINE_TEXT_LENGTH)
    translations: List[TranslationIn] = Field(default_factory=list)
    start_time_ms: int = Field(ge=0)
    end_time_ms: int = Field(ge=0)

    @field_validator("text")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("text cannot be empty")
        return value

    @model_validator(mode="after")
    def check_line(self) -> "SubtitleLineIn":
        if self.end_time_ms <= self.start_time_ms:
            raise ValueError(f"line {self.position}: end_time_ms must be greater than start_time_ms")

        translation_language_ids = [t.translation_language_id for t in self.translations]
        if len(set(translation_language_ids)) != len(translation_language_ids):
            raise ValueError(f"line {self.position}: a line cannot have two translations in the same language")

        return self


class CreateReelRequest(BaseModel):
    videoKey: str
    thumbnailKey: Optional[str] = None
    title: Optional[str] = Field(default=None, max_length=MAX_TITLE_LENGTH)
    language_id: int
    duration: int = Field(ge=1, le=MAX_DURATION_SECONDS)
    # `position` on each line is not authoritative - array order is (see
    # ReelCreationService.create_with_dialogue).
    lines: List[SubtitleLineIn] = Field(min_length=1, max_length=MAX_LINES)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        return value or None

    @model_validator(mode="after")
    def check_translation_languages(self) -> "CreateReelRequest":
        for line in self.lines:
            for translation in line.translations:
                if translation.translation_language_id == self.language_id:
                    raise ValueError(
                        f"line {line.position}: a translation cannot be in the same language as the reel itself"
                    )
        return self


class CreateReelPublishResponse(BaseModel):
    message: str
    reel: ReelResponse
