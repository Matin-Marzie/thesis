from jose import jwt, JWTError
from typing import Optional, Tuple
from pydantic import BaseModel

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
