from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    """Schema for full user data in API responses."""
    
    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True


class CreatorResponse(BaseModel):
    """Schema for creator data in reel responses (minimal user info)."""
    
    id: int
    username: str
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True
