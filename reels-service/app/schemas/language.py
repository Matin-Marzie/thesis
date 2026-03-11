from pydantic import BaseModel


class LanguageResponse(BaseModel):
    """Schema for language data in API responses."""
    
    id: int
    code: str
    name: str

    class Config:
        from_attributes = True
