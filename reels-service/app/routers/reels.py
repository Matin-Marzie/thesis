from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.services.reel_service import ReelService
from app.schemas.reel import ReelsListResponse


router = APIRouter(prefix="/reels", tags=["reels"])


@router.get(
    "",
    response_model=ReelsListResponse,
    summary="Get random reels",
    description="Retrieve a list of random reels based on the user's native and learning language.",
    responses={
        200: {"description": "Successfully retrieved reels"},
        400: {"description": "Invalid language codes"},
        404: {"description": "Language not found"},
    }
)
async def get_reels(
    native_language_code: str = Query(
        ...,
        description="ISO 639-1 code for user's native language (e.g., 'en', 'fa')",
        min_length=2,
        max_length=10,
        examples=["en", "fa", "el"]
    ),
    learning_language_code: str = Query(
        ...,
        description="ISO 639-1 code for language being learned (e.g., 'de', 'el')",
        min_length=2,
        max_length=10,
        examples=["de", "el", "en"]
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=50,
        description="Number of reels to return (default: 10, max: 50)"
    ),
    db: AsyncSession = Depends(get_db)
) -> ReelsListResponse:
    """
    Get random reels for language learning.
    
    This endpoint returns random reels in the learning language with
    translations provided in the native language. No authentication
    is required for this endpoint.
    
    Parameters:
    - **native_language_code**: The ISO 639-1 code of the user's native language.
      Translations will be provided in this language.
    - **learning_language_code**: The ISO 639-1 code of the language being learned.
      Reels will be filtered to show content in this language.
    - **limit**: Maximum number of reels to return (1-50, default: 10)
    
    Returns:
    - List of reels with dialogue, sentences, tokens, and translations
    """
    # Validate that the languages are different
    if native_language_code == learning_language_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Native and learning language codes must be different"
        )
    
    # Chech /services/reel_service.py
    service = ReelService(db)
    
    reels, total = await service.get_random_reels(
        native_language_code=native_language_code,
        learning_language_code=learning_language_code,
        limit=limit
    )
    
    if total == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No reels found for language '{learning_language_code}'"
        )
    
    return ReelsListResponse(
        reels=reels,
        total_reels_available_in_db_for_learning_language=total
    )
