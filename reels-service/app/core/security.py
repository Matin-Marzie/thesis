from jose import jwt, JWTError
from typing import Optional, Tuple
from pydantic import BaseModel
from fastapi import Header, HTTPException, status

from app.core.config import settings


class TokenPayload(BaseModel):
    """Schema for decoded JWT token payload."""
    id: Optional[int] = None
    username: Optional[str] = None


def decode_access_token(token: str) -> Tuple[Optional[int], Optional[str]]:
    """
    Decode JWT access token and extract user_id and username.
    
    Args:
        token: JWT access token string
        
    Returns:
        Tuple of (user_id, username) or (None, None) if invalid/expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.ACCESS_TOKEN_SECRET,
            algorithms=["HS256"]
        )
        user_id = payload.get("id")
        username = payload.get("username")

        if user_id is None:
            return None, None

        # The Node backend signs `id` as whatever type pg handed back for a
        # bigint column - a string, not a number - so it arrives here as a
        # JSON string. Coerce to int to match the type hint and so callers
        # can bind it against bigint columns (asyncpg rejects str/bigint
        # comparisons outright rather than implicitly casting).
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return None, None

        return user_id, username
    except JWTError:
        return None, None


def extract_token_from_header(authorization: Optional[str]) -> Optional[str]:
    """
    Extract Bearer token from Authorization header.
    
    Args:
        authorization: Authorization header value (e.g., "Bearer <token>")
        
    Returns:
        Token string or None if invalid format
    """
    if not authorization:
        return None
    
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    return parts[1]


def get_current_user(authorization: Optional[str] = Header(None)) -> Tuple[int, Optional[str]]:
    """
    FastAPI dependency that requires a valid access token, mirroring the
    Node backend's verifyJWT middleware. Unlike decode_access_token/
    extract_token_from_header (used directly by GET /reels to support
    anonymous requests), this raises rather than returning (None, None).
    """
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized - No token provided",
        )

    user_id, username = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden - Invalid token",
        )

    return user_id, username
