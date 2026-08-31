from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cdn import (
    CDN_PREFIXES,
    create_object_key,
    head_object,
    is_owned_key,
    presign_upload,
    public_object_url,
)
from app.core.limiter import limiter
from app.core.security import get_current_user
from app.db import get_db
from app.schemas.reel_creation import (
    CreateReelPublishResponse,
    CreateReelRequest,
    CreateReelResponse,
    PresignedFile,
    PresignUploadsRequest,
    PresignUploadsResponse,
)
from app.services.reel_creation_service import ReelCreationService

router = APIRouter(prefix="/reel", tags=["reel-creation"])

MAX_UPLOAD_BYTES = 100 * 1024 * 1024


def _valid_video_type(content_type: str) -> bool:
    return isinstance(content_type, str) and content_type.startswith("video/")


def _valid_image_type(content_type: str) -> bool:
    return isinstance(content_type, str) and content_type.startswith("image/")


@router.post(
    "/uploads/presign",
    response_model=PresignUploadsResponse,
    summary="Presign direct upload URLs for a new reel's video and thumbnail",
    description=(
        "The client must upload the files directly to the CDN using the returned "
        "URLs before calling POST /reel to create the reel."
    ),
    responses={
        400: {"description": "Invalid video/thumbnail metadata"},
        401: {"description": "Unauthorized - Missing or invalid token"},
    },
)
@limiter.limit("10/hour")
async def presign_uploads(
    request: Request,
    body: PresignUploadsRequest,
    current_user: tuple = Depends(get_current_user),
) -> PresignUploadsResponse:
    user_id, _ = current_user

    if not _valid_video_type(body.video.contentType) or body.video.size > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A valid video under 100MB is required")
    if body.thumbnail and (
        not _valid_image_type(body.thumbnail.contentType) or body.thumbnail.size > MAX_UPLOAD_BYTES
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid thumbnail")

    # Keys are generated server-side; the client receives upload permission
    # only for these specific objects.
    video_key = create_object_key(CDN_PREFIXES["reels"], user_id, body.video.fileName)
    thumbnail_key = (
        create_object_key(CDN_PREFIXES["reels"], user_id, body.thumbnail.fileName) if body.thumbnail else None
    )

    return PresignUploadsResponse(
        video=PresignedFile(key=video_key, url=presign_upload(video_key, body.video.contentType)),
        thumbnail=(
            PresignedFile(key=thumbnail_key, url=presign_upload(thumbnail_key, body.thumbnail.contentType))
            if thumbnail_key
            else None
        ),
    )


@router.post(
    "",
    response_model=CreateReelPublishResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create and publish a new reel with synced subtitles",
    description=(
        "Creates the reel + dialogue + subtitle sentences (with millisecond-precise timing) "
        "+ optional per-line translations in one transaction, from media already uploaded "
        "via POST /reel/uploads/presign."
    ),
    responses={
        400: {"description": "Validation error or unconfirmed upload"},
        401: {"description": "Unauthorized - Missing or invalid token"},
    },
)
@limiter.limit("10/hour")
async def create_reel(
    request: Request,
    body: CreateReelRequest,
    current_user: tuple = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CreateReelPublishResponse:
    user_id, _ = current_user

    if not is_owned_key(body.videoKey, CDN_PREFIXES["reels"], user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A valid uploaded video is required")
    if body.thumbnailKey and not is_owned_key(body.thumbnailKey, CDN_PREFIXES["reels"], user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid uploaded thumbnail")

    # Do not persist media URLs until R2 confirms both objects exist.
    try:
        await head_object(body.videoKey)
        if body.thumbnailKey:
            await head_object(body.thumbnailKey)
    except ClientError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded media could not be found - the upload may have failed or expired",
        )

    service = ReelCreationService(db)
    reel = await service.create_with_dialogue(
        created_by=user_id,
        url=public_object_url(body.videoKey),
        thumbnail_url=public_object_url(body.thumbnailKey) if body.thumbnailKey else None,
        title=body.title,
        language_id=body.language_id,
        duration=body.duration,
        lines=body.lines,
    )

    return CreateReelPublishResponse(
        message="Reel published successfully",
        reel=CreateReelResponse.model_validate(reel),
    )
