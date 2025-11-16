# Community Circles - Setup Instructions

## Issue Fixed

The UI was showing "No circles found" which is actually **correct behavior** when the database is empty. However, there were a few issues that needed to be fixed:

### Fixes Applied:

1. ✅ **Added CommunityCircle to models export** (`server/src/models/index.js`)
   - The model wasn't being exported, which could cause issues

2. ✅ **Improved error handling** in CircleList component
   - Added "Try Again" button for errors
   - Better error message display

3. ✅ **Added console logging** for debugging
   - Helps identify if API calls are working

## How to Test

### 1. Restart the Backend Server

The backend needs to be restarted to pick up the new routes:

```bash
cd server
npm run dev
```

### 2. Check the Backend is Running

Visit: `http://localhost:8000/api/health`

You should see:
```json
{
  "success": true,
  "message": "HabitForge API is running"
}
```

### 3. Test the Community API

Try accessing: `http://localhost:8000/api/community`

You should see:
```json
{
  "success": true,
  "data": [],
  "pagination": { ... }
}
```

### 4. Create Your First Circle

1. Go to `http://localhost:3001/community`
2. Click "Create Your First Circle" button
3. Fill in the form:
   - Name: "Test Circle"
   - Description: "My first community circle"
   - Max Members: 10
   - Public/Private: Choose one
4. Click "Create Circle"

### 5. Verify It Works

- The circle should appear in the list
- You should be able to click on it to view details
- You should be able to post messages
- You should see the leaderboard tab

## Common Issues

### Issue: "Failed to fetch circles"

**Solution:**
- Make sure backend server is running on port 8000
- Check browser console for detailed error
- Verify you're logged in (authentication required)

### Issue: "Network Error"

**Solution:**
- Backend server not running
- Check `VITE_API_BASE_URL` in `.env` file
- Should be: `VITE_API_BASE_URL=http://localhost:8000/api`

### Issue: "Unauthorized" or 401 Error

**Solution:**
- You need to be logged in
- Go to `/test-login` to log in
- Or register a new account

### Issue: Create button doesn't work

**Solution:**
- Check browser console for errors
- Make sure Modal component is working
- Try refreshing the page

## API Endpoints Available

All endpoints require authentication (Bearer token):

- `GET /api/community` - List all circles
- `POST /api/community` - Create a circle
- `GET /api/community/:id` - Get circle details
- `POST /api/community/:id/join` - Join a circle
- `DELETE /api/community/:id/leave` - Leave a circle
- `POST /api/community/:id/messages` - Post a message
- `GET /api/community/:id/leaderboard` - View leaderboard
- `PUT /api/community/:id/leaderboard/opt-out` - Toggle leaderboard visibility
- `POST /api/community/:id/messages/:messageId/report` - Report a message

## Database Collections

The feature uses the `communitycircles` collection in MongoDB:

```javascript
{
  name: String,
  description: String,
  createdBy: ObjectId,
  members: [{ userId, role, joinedAt, optOutOfLeaderboard }],
  maxMembers: Number,
  isPrivate: Boolean,
  inviteCode: String,
  messages: [{ userId, content, createdAt, reported }],
  moderationSettings: { ... },
  createdAt: Date,
  updatedAt: Date
}
```

## Testing Checklist

- [ ] Backend server is running
- [ ] Can access `/api/health` endpoint
- [ ] Can access `/api/community` endpoint
- [ ] User is logged in
- [ ] Can see Community page at `/community`
- [ ] Can click "Create Circle" button
- [ ] Modal opens when clicking create
- [ ] Can fill in and submit form
- [ ] Circle appears in list after creation
- [ ] Can click on circle to view details
- [ ] Can post messages
- [ ] Can view leaderboard
- [ ] Can toggle leaderboard visibility

## Next Steps

Once the basic functionality is working:

1. Create multiple circles to test the list view
2. Invite other users to test multi-user features
3. Test the leaderboard calculation
4. Test message rate limiting (try posting 11 messages)
5. Test reporting messages
6. Test leaving circles
7. Test private circles with invite codes

## Debug Mode

To see detailed logs, open browser console (F12) and look for:
- "Fetched circles: [...]" - Shows circles loaded
- "Error fetching circles: ..." - Shows any errors
- Network tab - Shows API requests and responses

## Support

If you're still having issues:
1. Check browser console for errors
2. Check backend server logs
3. Verify MongoDB is running
4. Check authentication token is valid
5. Try logging out and back in
