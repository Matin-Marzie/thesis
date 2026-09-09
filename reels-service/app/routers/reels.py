from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Union

from app.db import get_db
from app.services.reel_service import ReelService
from app.schemas.reel import ReelsListResponse, UserReelsListResponse
from app.schemas.dialogue import DialogueResponse
from app.core.security import decode_access_token, extract_token_from_header, get_current_user


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
    
    - If authenticated: Returns reels passing the comprehensibility filter
      (stage 1 of the recommendation engine), each carrying a
      comprehensibility_percentage (future stages will add ranking on top)
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
        reels, total, reason = await service.get_personalized_reels(
            user_id=user_id,
            native_language_code=native_language_code,
            learning_language_code=learning_language_code,
            limit=limit
        )
        # total > 0 but nothing survived stage 1 - distinct from "no reels
        # for this language at all" below, and distinct from each other.
        if total > 0 and len(reels) == 0:
            if reason == ReelService.NO_REELS_REASON_ALL_RECENTLY_VIEWED:
                detail = "You have viewed all of the videos of the database"
            else:
                detail = "Populate your vocabulary and try again"
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
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


@router.get(
    "/mine",
    response_model=UserReelsListResponse,
    summary="Get the current user's own reels",
    description=(
        "Retrieve the authenticated user's own reels, full shape (dialogue "
        "sentences, tokens, translations, stats). Used to populate the "
        "profile 'My Reels' list, since the Node backend's login/register "
        "payload only carries a few flat columns with no dialogue."
    ),
    responses={
        401: {"description": "Unauthorized - Missing or invalid token"},
    }
)
async def get_my_reels(
    limit: int = Query(
        default=30,
        ge=1,
        le=50,
        description="Number of reels to return (default: 30, max: 50)"
    ),
    current_user: tuple = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> UserReelsListResponse:
    user_id, _ = current_user

    service = ReelService(db)
    reels, total = await service.get_reels_by_creator(
        creator_id=user_id,
        viewer_id=user_id,
        limit=limit
    )

    return UserReelsListResponse(reels=reels, total=total)


@router.get(
    "/{reel_id}/dialogue",
    response_model=DialogueResponse,
    summary="Get a reel's dialogue (subtitles)",
    description=(
        "Retrieve one reel's dialogue - sentences, tokens, and all-language "
        "translations - on demand. Lets the frontend lazily load subtitles "
        "for a reel it already has but that arrived without dialogue (e.g. "
        "the Node backend's creator-profile reel list), by fetching this "
        "when the subtitle button is pressed instead of upfront."
    ),
    responses={
        404: {"description": "Reel not found, or has no dialogue"},
    }
)
async def get_reel_dialogue(
    reel_id: int,
    db: AsyncSession = Depends(get_db)
) -> DialogueResponse:
    service = ReelService(db)
    reel = await service.get_reel_by_id(reel_id)

    if not reel or not reel.dialogue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dialogue not found for this reel"
        )

    return await service.build_dialogue_response(reel.dialogue)
