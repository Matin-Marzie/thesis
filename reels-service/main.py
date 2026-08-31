from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.limiter import limiter
from app.routers import reels_router, reel_creation_router
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
    description="Reels microservice for language learning social media platform glosy",
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

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "message": "Too many reel uploads.\nYou have reached the limit.\nYou can upload 10 reels per hour.\nPlease try again later."
        },
    )


# The Node backend returns errors as {"message": ...}; mirror that here (in
# addition to FastAPI's default {"detail": ...}) so the frontend's shared
# `error.response?.data?.message` handling works for both backends.
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail, "detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    message = errors[0]["msg"] if errors else "Validation error"
    if message.startswith("Value error, "):
        message = message[len("Value error, "):]
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"message": message, "detail": errors},
    )


# Include routers
app.include_router(
    reels_router,
    prefix=settings.API_V1_PREFIX,
)
app.include_router(
    reel_creation_router,
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
