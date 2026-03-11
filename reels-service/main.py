from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import reels_router
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for application startup and shutdown.
    """
    # Startup: Can add database connection checks, cache warming, etc.
    yield
    # Shutdown: Dispose of database connections
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Reels microservice for language learning social media platform gloreels",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    reels_router,
    prefix=settings.API_V1_PREFIX,
)


@app.get("/", tags=["health"])
async def root():
    """Root endpoint for health check."""
    return {
        "service": settings.PROJECT_NAME,
        "status": "healthy",
        "version": "1.0.0"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
