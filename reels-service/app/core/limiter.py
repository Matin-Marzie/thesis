from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

from app.core.security import decode_access_token, extract_token_from_header

# Authenticated upload endpoints key by user id instead of IP, mirroring
# backend/middleware/rateLimiter.js's keyByUser - a genuine abuse case here
# is one account uploading too much, not one IP.
def _user_or_ip_key(request: Request) -> str:
    token = extract_token_from_header(request.headers.get("authorization"))
    if token:
        user_id, _ = decode_access_token(token)
        if user_id is not None:
            return f"user:{user_id}"
    return get_remote_address(request)


limiter = Limiter(key_func=_user_or_ip_key)
