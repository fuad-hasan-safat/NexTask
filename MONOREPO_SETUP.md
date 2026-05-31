# NexTask - Monorepo Setup

This is a monorepo containing both the backend and frontend for NexTask, a collaborative task management platform.

## Project Structure

```
├── backend/          # Express.js + TypeScript + Node.js backend
├── frontend/         # React + Vite + TypeScript frontend
├── package.json      # Root workspace package.json
├── vercel.json       # Vercel deployment configuration
└── README.md         # This file
```

## Prerequisites

- Node.js 18.x or 20.x
- npm 7+ (for workspace support)

## Installation

From the root directory, install all dependencies for both packages:

```bash
npm install
```

This will install dependencies for both `backend` and `frontend` workspaces.

## Development

Run both backend and frontend in development mode with hot reload:

```bash
npm run dev
```

Or run them individually:

```bash
npm run backend:dev    # Start backend only
npm run frontend:dev   # Start frontend only
```

## Building

Build both packages for production:

```bash
npm run build
```

Or build individually:

```bash
npm run backend:build
npm run frontend:build
```

## Production

After building, start the production server:

```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## Deployment to Vercel

### Prerequisites

- Vercel account
- Project pushed to GitHub/GitLab/Bitbucket

### Steps

1. **Connect your repository to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Select your repository
   - Select "NexTask" root folder

2. **Configure environment variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all required environment variables (see `.env.example`)

3. **Deploy**
   - Vercel will automatically detect the monorepo structure from `vercel.json`
   - Build command: `npm run build`
   - Output directory: This is auto-configured in `vercel.json`

### Vercel Configuration Details

The `vercel.json` file configures:

- Backend API routes (`/api/*`) → Node.js server
- Frontend routes (`/*`) → Static files from React build
- Environment for production builds

## Scripts

- `npm run dev` - Run both frontend and backend in development
- `npm run build` - Build both packages for production
- `npm run start` - Start production backend server
- `npm run backend:dev` - Run backend only
- `npm run backend:build` - Build backend only
- `npm run backend:start` - Start backend only
- `npm run frontend:dev` - Run frontend only
- `npm run frontend:build` - Build frontend only
- `npm run frontend:preview` - Preview production frontend build
- `npm run lint` - Lint frontend code

## Workspace Commands

You can run commands in specific workspaces:

```bash
npm run <script> -w backend    # Run script in backend workspace
npm run <script> -w frontend   # Run script in frontend workspace
```

## Notes

- Install all dependencies from the root directory
- Do not run `npm install` in individual `backend/` or `frontend/` directories
- Both packages use shared Node modules installed in the root `node_modules/`
- The `concurrently` package is used to run dev servers simultaneously
