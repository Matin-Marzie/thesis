from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server Configuration
    PORT: int = 3600
    DEBUG: bool = False
    
    # Database Configuration
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "thesis_db"
    DB_USER: str = "root"
    DB_PASSWORD: str = "1234"
    DB_POOL_MIN: int = 2
    DB_POOL_MAX: int = 10
    DB_SSL: bool = False
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Reels Service"

    # Recommendation engine - stage 1, ComprehensibilityFilter: minimum
    # proportion of a reel's unique word tokens that must already be in the
    # user's vocabulary for the reel to pass. Nation (2001) puts the
    # threshold for comfortable comprehension at 98%; kept low for now
    # since the reel catalog is still tiny.
    COMPREHENSIBILITY_THRESHOLD: float = 0.5

    # Stage 1 also excludes any reel the user watched within this many
    # hours, so a reel doesn't reappear in the feed right after being seen.
    RECENTLY_VIEWED_COOLDOWN_HOURS: int = 24

    # JWT Configuration
    ACCESS_TOKEN_SECRET: str = ""

    # CDN (Cloudflare R2) Configuration - shared bucket with the Node backend
    CDN_ENDPOINT: str = ""
    CDN_ACCESS_KEY_ID: str = ""
    CDN_SECRET_ACCESS_KEY: str = ""
    CDN_BUCKET_NAME: str = ""
    CDN_PUBLIC_URL: str = ""

    @property
    def database_url(self) -> str:
        """Construct the database connection URL."""
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    @property
    def sync_database_url(self) -> str:
        """Construct the synchronous database connection URL."""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
