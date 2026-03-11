# Reels Service

A FastAPI microservice for managing video reels in a language learning social media platform.

## Project Structure

```
reels-service/
├── app/
│   ├── core/           # Configuration and settings
│   │   ├── __init__.py
│   │   └── config.py
│   ├── db/             # Database connection and session
│   │   ├── __init__.py
│   │   └── session.py
│   ├── models/         # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── dialogue.py
│   │   ├── language.py
│   │   ├── reel.py
│   │   ├── sentence.py
│   │   ├── user.py
│   │   └── word.py
│   ├── routers/        # API route handlers
│   │   ├── __init__.py
│   │   └── reels.py
│   ├── schemas/        # Pydantic schemas for request/response
│   │   ├── __init__.py
│   │   ├── dialogue.py
│   │   ├── language.py
│   │   ├── reel.py
│   │   ├── sentence.py
│   │   ├── user.py
│   │   └── word.py
│   ├── services/       # Business logic layer
│   │   ├── __init__.py
│   │   └── reel_service.py
│   └── utils/          # Helper functions
│       └── __init__.py
├── .env                # Environment configuration
├── .gitignore
├── main.py             # Application entry point
├── requirements.txt
└── README.md
```

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update the values:

```env
PORT=3600
DB_HOST=localhost
DB_PORT=5432
DB_NAME=thesis_db
DB_USER=root
DB_PASSWORD=1234
```

### 4. Run the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload --port 3600

# Or run directly
python main.py
```

### Setup without virtual environment

```bash
pip install -r requirements.txt --break-system-packages
```


## API Endpoints

### Get Random Reels

```
GET /api/v1/reels?native_language_code=en&learning_language_code=fa 
```

**Query Parameters:**
- `native_language_code` (required): ISO 639-1 code for user's native language
- `learning_language_code` (required): ISO 639-1 code for language being learned
- `limit` (optional): Number of reels to return (default: 10, max: 50)

**Example Response:**
```json
{
    "reels": [
        {
        "id": 1,
        "url": "https://cdn.example.com/reels/1.mp4",
        "thumbnail_url": "https://cdn.example.com/reels/1.jpg",
        "title": "At the coffee shop",
        "duration": 45,
        "created_at": "2026-03-01T10:22:00Z",
        "language": {
            "id": 1,
            "code": "de"
            "name": "German"
        },
        "created_by": {
            "id": 12,
            "username": "langmaster",
            "profile_picture": "https://cdn.example.com/users/12.jpg"
        },
        "stats": {
            "views": 2341,
            "likes": 891,
            "comments": 54,
            "saves": 120
        },
        "user_interaction": {
            "viewed_at": "2026-03-01T10:22:00Z",
            "is_liked": true,
            "is_saved": false,
            "is_shared": false,
            "comment": null
        },
        "dialogue": {
            "id": 3,
            "created_at": "2026-03-01T10:22:00Z",
            "sentences": [
            {
                "id": 1,
                "position": 1,
                "start_time_ms": 0,
                "end_time_ms": 3200,
                "text": "Ich hätte gerne einen Kaffee.",
                "normalized_text": "ich hatte gerne einen kaffee",
                "translation": "I would like a coffee.",
                "tokens": [
                {
                    "id": 1,
                    "position": 1,
                    "part_of_speech": "pronoun",
                    "word": {
                    "id": 10,
                    "written_form": "Ich",
                    "part_of_speech": "pronoun",
                    "level": "A1",
                    "article": null,
                    "audio_url": "https://cdn.example.com/words/10.mp3",
                    "image_url": null
                    }
                },
                {
                    "id": 2,
                    "position": 2,
                    "part_of_speech": "verb",
                    "word": {
                    "id": 11,
                    "written_form": "hätte",
                    "part_of_speech": "verb",
                    "level": "A2",
                    "article": null,
                    "audio_url": "https://cdn.example.com/words/11.mp3",
                    "image_url": null
                    }
                }
                ]
            },
            {
                "id": 2,
                "position": 2,
                "start_time_ms": 3200,
                "end_time_ms": 6800,
                "text": "Groß oder klein?",
                "normalized_text": "gross oder klein",
                "translation": "Large or small?",
                "tokens": [...]
            }
            ]
        },
        }
    ],
    "total_reels_available_in_db_for_learning_language" : 6
}
```

### Health Check

```
GET /health
```

## Documentation

- Swagger UI: http://localhost:3600/docs
- ReDoc: http://localhost:3600/redoc
- OpenAPI JSON: http://localhost:3600/openapi.json

## Development

### Code Formatting

```bash
black .
isort .
```

### Linting

```bash
flake8 .
mypy .
```

### Testing

```bash
pytest
```
