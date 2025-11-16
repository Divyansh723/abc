# HabitForge Setup Guide

This guide will help you set up the complete HabitForge application with MongoDB integration.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Quick Setup

### 1. Install MongoDB

**Option A: Local MongoDB Installation**
- **Windows**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Update `server/.env` with your connection string

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your MongoDB connection
# For local MongoDB: MONGODB_URI=mongodb://localhost:27017/habitforge
# For Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habitforge

# Start the backend server
npm run dev
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# In a new terminal, navigate to project root
cd ..

# Install frontend dependencies (if not already done)
npm install

# Update environment to use real API
# Edit .env file and set:
# VITE_MOCK_API=false

# Start the frontend development server
npm run dev -- --port 3001
```

The frontend will be available at `http://localhost:3001`

## Verification

1. **Check Backend**: Visit `http://localhost:8000/api/health`
   - Should return: `{"success": true, "message": "HabitForge API is running"}`

2. **Check Database Connection**: Look for "MongoDB Connected" in backend console

3. **Test Frontend**: 
   - Visit `http://localhost:3001`
   - Try registering a new account
   - Create a habit and mark it complete

## Environment Configuration

### Backend (.env)
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/habitforge

# JWT Configuration (generate secure keys for production)
JWT_SECRET=habitforge-super-secret-jwt-key-development-only
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=habitforge-super-secret-refresh-key-development-only
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=HabitForge

# Development
VITE_DEBUG_MODE=true
VITE_MOCK_API=false

# Feature Flags
VITE_COMMUNITY_FEATURES_ENABLED=true
VITE_ANALYTICS_ENABLED=true
VITE_NOTIFICATIONS_ENABLED=true
```

## Troubleshooting

### MongoDB Connection Issues
- **Local MongoDB**: Ensure MongoDB service is running (`mongod`)
- **Atlas**: Check connection string, whitelist IP address, verify credentials

### Port Conflicts
- Backend default: 8000
- Frontend default: 3001
- Change ports in respective .env files if needed

### CORS Issues
- Ensure `FRONTEND_URL` in backend .env matches frontend URL
- Check that both servers are running on correct ports

### Authentication Issues
- Clear browser localStorage: `localStorage.clear()`
- Restart both servers
- Check JWT secrets are set in backend .env

## Development Workflow

1. **Start MongoDB** (if using local installation)
2. **Start Backend**: `cd server && npm run dev`
3. **Start Frontend**: `npm run dev -- --port 3001`
4. **Make changes** and both servers will auto-reload

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Generate secure JWT secrets
4. Deploy to service like Heroku, Railway, or DigitalOcean

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API URL in environment variables

## API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Create habit (replace TOKEN with actual token from login)
curl -X POST http://localhost:8000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Morning Exercise","category":"fitness","frequency":"daily","color":"#3B82F6","icon":"💪"}'
```

## Next Steps

Once everything is running:

1. **Create your first user account**
2. **Add some habits**
3. **Mark habits as complete**
4. **Explore the analytics and gamification features**
5. **Customize your profile and settings**

## Support

If you encounter issues:
1. Check the console logs for both frontend and backend
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that all dependencies are installed