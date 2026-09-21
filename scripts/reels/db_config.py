"""
Database settings for the reel scripts, read from scripts/reels/.env
(copy scripts/reels/.env.example to scripts/reels/.env and fill it in).
"""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).resolve().parent

REQUIRED_ENV_VARS = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"]


def load_config() -> dict:
    load_dotenv(SCRIPT_DIR / ".env")
    missing = [name for name in REQUIRED_ENV_VARS if not os.environ.get(name)]
    if missing:
        sys.exit(
            "Missing required config: " + ", ".join(missing) +
            f"\nCopy {SCRIPT_DIR / '.env.example'} to {SCRIPT_DIR / '.env'} and fill it in."
        )
    return {name: os.environ[name] for name in REQUIRED_ENV_VARS}
