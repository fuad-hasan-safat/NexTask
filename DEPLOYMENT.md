# 🚀 Deployment Checklist & Guide

## Pre-Deployment

- [ ] All tests passing locally
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linting errors: `npm run lint`
- [ ] `npm run build` succeeds without errors
- [ ] Environment variables configured
- [ ] MongoDB connection tested

## Frontend Deployment (Vercel)

### Setup

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel will automatically detect this is a monorepo

### Configuration

Vercel will automatically use `vercel.json`:

- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `frontend/dist`

### Environment Variables (in Vercel)

```
VITE_API_BASE_URL=https://your-backend-url/api
```

### Deployment Trigger

- Automatic on push to `main` branch
- Manual redeploy from Vercel dashboard

## Backend Deployment (Railway/Render/Heroku)

### Prerequisites

- Backend running successfully locally
- MongoDB Atlas account (or local MongoDB)

### Environment Variables (on hosting)

```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db
JWT_SECRET=generate-a-random-secret
NODE_ENV=production
```

### Deploy Steps (Railway example)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project → GitHub repository
4. Select `backend` directory
5. Add environment variables
6. Deploy

### Deploy Steps (Render example)

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Build command: `npm run build -w backend`
5. Start command: `npm run start -w backend`
6. Add environment variables
7. Deploy

### Deploy Steps (Heroku example)

```bash
heroku create nextask-backend
heroku config:set MONGODB_URI=<your-mongo-uri>
heroku config:set JWT_SECRET=<secret>
git push heroku main
```

## Post-Deployment

### Frontend (Vercel)

- [ ] Visit your Vercel URL
- [ ] Check that frontend loads
- [ ] Test navigation and UI

### Backend

- [ ] Test API endpoints
- [ ] Check MongoDB connection
- [ ] Monitor logs for errors

### Integration

- [ ] Update frontend `VITE_API_BASE_URL` to point to backend
- [ ] Test real-time features (Socket.io)
- [ ] Test authentication flow
- [ ] Test database operations

## Monitoring & Maintenance

### Vercel

- Check deployment logs if build fails
- Use Vercel Analytics to monitor performance
- Set up error tracking (Sentry recommended)

### Backend

- Monitor application logs
- Set up error alerts
- Monitor database performance
- Set up uptime monitoring

## Rollback

### Vercel

- Use Vercel dashboard to deploy previous version
- Or push git revert commit

### Backend (Railway)

1. Go to project dashboard
2. Select previous deployment
3. Click "Redeploy"

### Backend (Render)

1. Go to project dashboard
2. Select previous deployment
3. Click "Deploy"

## Common Issues & Solutions

### Build Fails on Vercel

1. Check `npm run build` works locally
2. Verify all dependencies are in package.json
3. Check environment variables are set
4. Clear Vercel cache and redeploy

### API Connection Fails

1. Check backend is running
2. Verify `VITE_API_BASE_URL` is correct
3. Check CORS settings in backend
4. Ensure backend environment variables are set

### MongoDB Connection Fails

1. Check `MONGODB_URI` is correct
2. Verify IP whitelist includes hosting provider
3. Check MongoDB credentials
4. Test connection string locally

### Socket.io Events Not Working

1. Verify Socket.io server running on backend
2. Check WebSocket is not blocked by firewall
3. Verify client connects to correct server URL
4. Check CORS settings for Socket.io

## Performance Tips

- Enable Vercel Edge Caching
- Use MongoDB indexes
- Implement database query optimization
- Monitor API response times
- Use CDN for static assets

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong MongoDB password
- [ ] Enable HTTPS (Vercel does automatically)
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
