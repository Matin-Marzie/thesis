from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Union

from app.db import get_db
from app.services.reel_service import ReelService
from app.schemas.reel import ReelsListResponse
from app.core.security import decode_access_token, extract_token_from_header


router = APIRouter(prefix="/reels", tags=["reels"])


@router.get(
    "",
    response_model=None,
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
    authorization: Optional[str] = Header(None, description="Bearer access token"),
    db: AsyncSession = Depends(get_db)
) -> Union[ReelsListResponse, dict]:
    """
    Get random reels for language learning.
    
    This endpoint returns random reels in the learning language with
    translations provided in the native language.
    
    - If authenticated: Returns personalized reels (future: ML/Cosine similarity)
    - If not authenticated: Returns random reels
    
    Parameters:
    - **native_language_code**: The ISO 639-1 code of the user's native language.
      Translations will be provided in this language.
    - **learning_language_code**: The ISO 639-1 code of the language being learned.
      Reels will be filtered to show content in this language.
    - **limit**: Maximum number of reels to return (1-50, default: 10)
    - **authorization**: Optional Bearer token for authenticated requests
    
    Returns:
    - List of reels with dialogue, sentences, tokens, and translations
    """
    # Check for authentication
    token = extract_token_from_header(authorization)
    user_id, username = None, None
    
    if token:
        user_id, username = decode_access_token(token)
    

    # Validate that the languages are different
    if native_language_code == learning_language_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Native and learning language codes must be different"
        )
    
    # Chech /services/reel_service.py
    service = ReelService(db)

    if user_id: # Authenticated user
        # reels, total = await service.get_personalized_reels(
        #     user_id=user_id,
        #     native_language_code=native_language_code,
        #     learning_language_code=learning_language_code,
        #     limit=limit
        # )
        reels, total = await service.get_random_reels(
        native_language_code=native_language_code,
        learning_language_code=learning_language_code,
        limit=limit
        )
    else: # Not authenticated user
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
