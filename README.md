# Developing a Mobile-Assisted Language Learning Application Utilizing Short-Form Video Reels and Hypercasual games

## Download the App (Android)

[![Download APK](https://img.shields.io/badge/Download-APK-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/Matin-Marzie/thesis/releases/download/v1.0.0/app-release.apk)

Or grab the latest from the [Releases page](https://github.com/Matin-Marzie/thesis/releases/latest).

Open the link on your phone, download the APK, and install it (you may need to allow installs from your browser/file manager in Android's settings).

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
