from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Union

from app.db import get_db
from app.services.reel_service import ReelService
from app.schemas.reel import ReelsListResponse, UserReelsListResponse
from app.schemas.dialogue import DialogueResponse
from app.core.security import decode_access_token, extract_token_from_header, get_current_user


router = APIRouter(prefix="/reels", tags=["reels"])


def _parse_csv_int_list(raw: Optional[str], field_name: str) -> Optional[list]:
    """Parses a comma-separated query param (e.g. 'due_word_ids=12,45,9')
    into a list of ints, or None if not given. Shared by due_word_ids and
    exclude_reel_ids, both plain frontend-supplied id lists."""
    if not raw:
        return None
    try:
        return [int(value) for value in raw.split(",") if value.strip()]
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be a comma-separated list of integers"
        )


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
    due_word_ids: Optional[str] = Query(
        None,
        description=(
            "Comma-separated word ids from the frontend's spaced-repetition "
            "(Duo words) due queue, oldest-due-first (e.g. '12,45,9'). Feeds "
            "the recommendation engine's Stage 2 (SpacedRepetitionPrioritizer), "
            "which ranks reels containing one of these words first - applies "
            "to guests too, not just authenticated requests."
        ),
        examples=["12,45,9"]
    ),
    exclude_reel_ids: Optional[str] = Query(
        None,
        description=(
            "Comma-separated reel ids the frontend has already shown this "
            "session (e.g. '101,202,303'). Mainly for guests, who have no "
            "server-side account to key an already-seen exclusion off of - "
            "authenticated requests already get that server-side."
        ),
        examples=["101,202,303"]
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

    # Parse the frontend-supplied, per-request signals - see
    # ReelService.get_personalized_reels/get_random_reels for how each is used.
    due_word_ids_fifo = _parse_csv_int_list(due_word_ids, "due_word_ids")
    exclude_reel_ids_list = _parse_csv_int_list(exclude_reel_ids, "exclude_reel_ids")

    # Chech /services/reel_service.py
    service = ReelService(db)

    if user_id: # Authenticated user
        reels, total, reason = await service.get_personalized_reels(
            user_id=user_id,
            native_language_code=native_language_code,
            learning_language_code=learning_language_code,
            limit=limit,
            due_word_ids_fifo=due_word_ids_fifo,
            exclude_reel_ids=exclude_reel_ids_list
        )
    else: # Not authenticated user
        reels, total, reason = await service.get_random_reels(
            native_language_code=native_language_code,
            learning_language_code=learning_language_code,
            limit=limit,
            due_word_ids_fifo=due_word_ids_fifo,
            exclude_reel_ids=exclude_reel_ids_list
        )

    # total > 0 but nothing came back - distinct from "no reels for this
    # language at all" below, and distinct from each other reason. Applies
    # to guests now too: get_random_reels can hit NO_REELS_REASON_ALL_RECENTLY_VIEWED
    # via a frontend-supplied exclude_reel_ids that covers the whole language,
    # same as an authenticated user's server-tracked cooldown exclusion.
    if total > 0 and len(reels) == 0:
        if reason == ReelService.NO_REELS_REASON_ALL_RECENTLY_VIEWED:
            detail = "You have watched all of the reels of the database, come back tomorrow"
        elif reason == ReelService.NO_REELS_REASON_COMPREHENSION_FILTER:
            detail = "You've already watched all the reels in the database that match your current vocabulary. Keep learning new words to unlock more!"
        else:
            detail = f"No reels found for language '{learning_language_code}'"
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

    if total == 0:
        if reason == ReelService.NO_REELS_REASON_EMPTY_DATABASE:
            detail = "There are no videos in the database"
        else:
            detail = f"No reels found for language '{learning_language_code}'"
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    
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
