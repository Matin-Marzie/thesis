# Personalized Language Learning Application

## Prerequisites

- Node.js 18+ & npm
- Docker & Docker Compose (for backend)
- Git


## Download app
```bash
git --version
```
```bash
  git clone https://github.com/Matin-Marzie/thesis
```

## Backend Setup

```bash
# Navigate to backend directory
cd backend

# Check Node.js version
node --version
npm --version

# Install dependencies
npm install

# Start backend with Docker Compose
docker compose up
```

Backend runs on `http://localhost:3500`
API Documentation: `http://localhost:3500/api-docs`

## Frontend Setup

```bash
# Navigate to frontend directory
cd ..
cd frontend

# Check Node.js version
node --version
npm --version

# Install dependencies
npm install

# Start development server
npx expo start
```

Follow the prompts to run on Android emulator, iOS simulator, or device via Expo Go.

## Project Structure

```
thesis-matin/
├── backend/          # Node.js/Express API
├── frontend/         # React Native (Expo)
└── database/         # PostgreSQL schema & data
```

## API Documentation

Visit `http://localhost:3500/api-docs` for full Swagger API documentation.
