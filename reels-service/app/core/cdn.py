import asyncio
import re
import time
import uuid

import boto3
from botocore.config import Config as BotoConfig

from app.core.config import settings

# Port of backend/utils/cdn.js - both services share one R2 bucket, so key
# layout, ownership rules, and public URL shape must stay identical to what
# the Node backend already wrote to the database.

CDN_PREFIXES = {
    "reels": "reels",
    "profile_pictures": "profile_pictures",
}

_client = boto3.client(
    "s3",
    region_name="auto",
    endpoint_url=settings.CDN_ENDPOINT,
    aws_access_key_id=settings.CDN_ACCESS_KEY_ID,
    aws_secret_access_key=settings.CDN_SECRET_ACCESS_KEY,
    # Virtual-hosted-style ("<bucket>.<account>.r2.cloudflarestorage.com"),
    # matching the Node backend's AWS SDK v3 client (no forcePathStyle set,
    # which defaults to virtual-hosted there) - kept identical so presigned
    # URLs from either service hit R2 the same way.
    config=BotoConfig(signature_version="s3v4", s3={"addressing_style": "virtual"}),
)


def create_object_key(prefix: str, user_id: int, file_name: str = "") -> str:
    extension = ""
    if "." in file_name:
        raw_ext = file_name.rsplit(".", 1)[-1].lower()
        cleaned_ext = re.sub(r"[^a-z0-9]", "", raw_ext)
        extension = f".{cleaned_ext}" if cleaned_ext else ""
    return f"{prefix}/{user_id}/{int(time.time() * 1000)}-{uuid.uuid4()}{extension}"


def public_object_url(key: str) -> str:
    return f"{settings.CDN_PUBLIC_URL.rstrip('/')}/{key}"


# Ownership checks prevent users from attaching or deleting another user's media.
def is_owned_key(key: str, prefix: str, user_id: int) -> bool:
    return isinstance(key, str) and key.startswith(f"{prefix}/{user_id}/") and ".." not in key


def presign_upload(key: str, content_type: str, expires_in: int = 900) -> str:
    return _client.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.CDN_BUCKET_NAME, "Key": key, "ContentType": content_type},
        ExpiresIn=expires_in,
    )


# Verify that the client completed the direct upload before writing its URL
# to the database. Runs the blocking boto3 call off the event loop.
async def head_object(key: str) -> None:
    await asyncio.to_thread(_client.head_object, Bucket=settings.CDN_BUCKET_NAME, Key=key)
