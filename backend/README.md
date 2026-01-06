# Backend - Personalized Language Learning API

## Prerequisites

- Docker & Docker Compose (for containerized setup)
- Node.js 18+ & npm (for local development)
- PostgreSQL 15+ (if running locally)

## Installation & Setup

### Option 1: Docker (Recommended)

1. From project root (`thesis-matin/`):
```bash
docker compose up --build
```

Backend runs on `http://localhost:3500`
Database runs on `localhost:5433`

### Option 2: Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (already exists with defaults):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=thesis_db
DB_USER=root
DB_PASSWORD=1234
PORT=3500
NODE_ENV=development
```

3. Initialize database:
```bash
# Create database and import schema
psql -U root -h localhost -d thesis_db -f ../database/thesis_db.sql
```

4. Start development server:
```bash
npm run dev
```

Backend runs on `http://localhost:3500`

## API Documentation

Access Swagger UI at: `http://localhost:3500/api-docs`

## Scripts

- `npm start` - Production server
- `npm run dev` - Development with hot reload (nodemon)
- `npm test` - Run tests
