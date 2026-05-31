# NexTask - Development Guide

This project consists of two independent applications: Backend and Frontend.

## Project Structure

```
NexTask/
├── backend/          # Express.js + MongoDB API
├── frontend/         # React + Vite SPA
├── README.md
├── package.json      # Root-level convenience scripts
└── vercel.json       # Vercel deployment config
```

## Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend will run on `http://localhost:5000` (or configured port)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

### Run Both Simultaneously

Open two terminals and run the commands above in each.

## Building

### Build Frontend (for Vercel)

```bash
npm run build
```

This builds the frontend and outputs to `frontend/dist`

### Build Backend

```bash
npm run backend:build
```

### Build Both Locally

```bash
npm run backend:build
npm run frontend:build
```

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
```

### Frontend (`frontend/.env`)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Deployment

### Vercel (Frontend)

The `vercel.json` automatically:

1. Installs frontend dependencies
2. Builds the frontend
3. Deploys from `frontend/dist`

### Backend

Deploy separately on your hosting provider (Railway, Render, etc.)

## Useful Commands

```bash
# Root-level shortcuts
npm run backend:dev      # Run backend in dev mode
npm run backend:build    # Build backend
npm run backend:start    # Start built backend
npm run frontend:dev     # Run frontend in dev mode
npm run frontend:build   # Build frontend
npm run frontend:preview # Preview built frontend
npm run lint            # Lint frontend code
```

## Notes

- Backend and frontend are completely independent
- No monorepo complexity - each has its own dependencies
- Frontend environment variables configured in Vite
- Backend configuration managed via .env files
