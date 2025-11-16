# Challenges Not Showing - Troubleshooting Guide

## Issue
Challenges are not appearing on the Goals page.

## Root Cause
The backend routes were just added and the frontend may need to refresh or re-authenticate.

## Solution Steps

### 1. Hard Refresh the Browser
Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac) to do a hard refresh and clear the cache.

### 2. Check if You're Logged In
- Make sure you're logged into the application
- If not, log in with your credentials
- The token might have expired, so logging out and back in can help

### 3. Check Browser Console
Open the browser console (F12) and look for:
- Any error messages related to challenges
- 401 Unauthorized errors (means you need to log in again)
- Network requests to `/api/challenges/personal`

### 4. Verify Backend is Running
The backend should show these routes are available:
- GET `/api/challenges/personal` - List all challenges
- GET `/api/challenges/personal/:id` - Get challenge details
- POST `/api/challenges/personal/:challengeId/join` - Join a challenge

### 5. Check Database
Run the seed script to ensure challenges are in the database:
```bash
node .\server\src\scripts\seedChallenges.js
```

You should see:
```
Successfully seeded 5 challenges:
  - 🔥 7-Day Streak Master (easy)
  - 💯 Century Club (medium)
  - 💪 Health Hero (medium)
  - 🧘 Mindful Month (hard)
  - 🚀 Productivity Pro (hard)
```

## Expected Behavior

When working correctly, you should see:
1. The "Challenges" tab on the Goals page
2. A grid of 5 challenge cards
3. Each card showing:
   - Challenge icon and title
   - Difficulty badge
   - Description
   - XP reward
   - "Join Challenge" button (if not joined)
   - Progress bar (if joined)

## API Endpoints

The frontend calls these endpoints:
- `GET /api/challenges/personal` - Fetch all challenges
- `GET /api/challenges/personal/participations/active` - Get active participations
- `GET /api/challenges/personal/history/all` - Get challenge history
- `POST /api/challenges/personal/:challengeId/join` - Join a challenge
- `POST /api/challenges/personal/participations/:participationId/abandon` - Abandon a challenge

## Common Issues

### 401 Unauthorized
**Cause**: Token expired or not sent
**Solution**: Log out and log back in

### 404 Not Found
**Cause**: Routes not registered properly
**Solution**: Restart the backend server

### Empty Challenge List
**Cause**: Challenges not seeded in database
**Solution**: Run the seed script

### Network Error
**Cause**: Backend not running or wrong URL
**Solution**: Check that backend is running on port 8000

## Testing the API Directly

You can test the API using curl or Postman:

1. Get your auth token from localStorage (open browser console):
```javascript
localStorage.getItem('token')
```

2. Test the endpoint:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:8000/api/challenges/personal
```

You should get a JSON response with 5 challenges.

## Status Check

Run these checks:
- [ ] Backend server is running (port 8000)
- [ ] Frontend server is running (port 3001)
- [ ] User is logged in
- [ ] Challenges are seeded in database
- [ ] Browser cache is cleared
- [ ] No console errors in browser

If all checks pass and challenges still don't show, check the browser Network tab to see the actual API response.
