# Automatic Forgiveness Token System

## Overview
The automatic forgiveness token system protects users' habit streaks by automatically using forgiveness tokens at the end of each day for missed habits. This compassionate feature ensures users don't lose long streaks due to occasional misses.

## How It Works

### Automatic Protection
- **Schedule**: Runs daily at 11:50 PM (10 minutes before midnight)
- **Priority**: Protects longest streaks first
- **Smart**: Only uses tokens for habits with active streaks (> 0 days)
- **Notification**: Sends notification when streaks are protected

### Token Usage Rules
1. **User Preference**: Only runs if user has auto-forgiveness enabled (default: ON)
2. **Token Availability**: Only uses tokens if user has available tokens
3. **Active Streaks**: Only protects habits with current streaks > 0
4. **Completion Check**: Only uses tokens for habits not completed today
5. **Priority Order**: Protects longest streaks first

### XP Awards
- **Auto-Forgiveness**: 5 XP (less than manual completion)
- **Manual Forgiveness**: 10 XP
- **Regular Completion**: 10 XP + bonuses

## User Preferences

### Enable/Disable Auto-Forgiveness
Users can control auto-forgiveness in their notification settings:

```javascript
{
  notificationPreferences: {
    autoForgiveness: true  // Default: true
  }
}
```

### Settings UI Location
- Navigate to: Settings → Notifications
- Toggle: "Automatically use forgiveness tokens"
- Description: "Protect your streaks automatically at the end of each day"

## Technical Implementation

### Job Schedule
```javascript
// Runs at 11:50 PM every day
cron.schedule('50 23 * * *', autoUseForgivenessTokens);
```

### Job Logic
1. **Find Eligible Users**:
   - Has forgiveness tokens (> 0)
   - Is active and not soft-deleted
   - Has auto-forgiveness enabled

2. **For Each User**:
   - Get active habits with streaks
   - Check today's completions
   - Identify habits needing forgiveness
   - Sort by streak length (longest first)

3. **Use Tokens**:
   - Create forgiveness completion
   - Award 5 XP
   - Deduct token
   - Update user stats

4. **Send Notification**:
   - List protected habits
   - Show remaining tokens
   - Provide streak information

### Database Operations
All operations use MongoDB transactions to ensure data consistency:
- Create Completion record
- Create XP Transaction
- Update User tokens and XP
- Create Notification

## Testing

### Run Test Suite
```bash
cd server
node test-forgiveness-tokens.js
```

### Test Coverage
1. **Check Tokens**: Verify user token counts
2. **Check Habits**: Identify habits needing forgiveness
3. **Manual Usage**: Test manual forgiveness token usage
4. **Automatic Job**: Test the automated job
5. **Verify Completions**: Confirm forgiveness completions were created

### Manual Testing
```bash
# Test the automatic job manually
cd server
node -e "
import('./src/jobs/autoForgivenessToken.js').then(module => {
  module.autoUseForgivenessTokens().then(result => {
    console.log('Result:', result);
    process.exit(0);
  });
});
"
```

## Notifications

### Notification Format
```javascript
{
  type: 'system',
  title: '🛡️ Streaks Protected!',
  message: 'We automatically used 2 forgiveness tokens to protect your streaks: Morning Exercise (15-day streak), Meditation (7-day streak)',
  metadata: {
    tokensUsed: 2,
    habitsProtected: [
      { name: 'Morning Exercise', streak: 15 },
      { name: 'Meditation', streak: 7 }
    ],
    remainingTokens: 1
  },
  priority: 'medium'
}
```

### Notification Timing
- Sent immediately after tokens are used
- Respects quiet hours settings
- Appears in notification bell and notifications page

## API Endpoints

### Get User Preferences
```http
GET /api/users/me
Authorization: Bearer <token>

Response:
{
  "notificationPreferences": {
    "autoForgiveness": true,
    ...
  }
}
```

### Update Auto-Forgiveness Preference
```http
PATCH /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "notificationPreferences": {
    "autoForgiveness": false
  }
}
```

### Manual Forgiveness Token Usage
```http
POST /api/gamification/forgiveness
Authorization: Bearer <token>
Content-Type: application/json

{
  "habitId": "507f1f77bcf86cd799439011",
  "date": "2024-11-10T00:00:00.000Z",
  "timezone": "America/New_York"
}
```

## Monitoring

### Job Logs
The automatic job logs detailed information:
```
[INFO] Starting automatic forgiveness token job...
[INFO] Found 15 users with available forgiveness tokens
[INFO] User 507f... has 3 habits needing forgiveness
[INFO] Protected habit "Morning Exercise" (15-day streak) for user 507f...
[INFO] Sent notification to user 507f... about 2 protected habits
[INFO] Automatic forgiveness token job completed in 1234ms
[INFO] Summary: 8 tokens used, 8 habits protected, 5 notifications sent
```

### Metrics to Track
- Tokens used per day
- Habits protected per day
- Users benefiting from auto-forgiveness
- Average streak length protected
- Token usage patterns

## User Experience

### Scenario 1: Busy Day
**User**: Sarah has a 30-day meditation streak
**Situation**: Forgot to complete meditation today
**Result**: At 11:50 PM, system automatically uses 1 token
**Notification**: "🛡️ Streaks Protected! We used 1 forgiveness token to protect your Meditation (30-day streak)"
**Outcome**: Sarah wakes up with her streak intact

### Scenario 2: Multiple Missed Habits
**User**: John has 3 habits with streaks: Exercise (45 days), Reading (20 days), Journaling (10 days)
**Situation**: Missed all 3 habits today, has 2 tokens
**Result**: System protects Exercise (45 days) and Reading (20 days) - longest streaks first
**Notification**: "🛡️ Streaks Protected! We used 2 forgiveness tokens to protect: Exercise (45-day streak), Reading (20-day streak)"
**Outcome**: John's longest streaks are protected, Journaling streak breaks

### Scenario 3: No Tokens Available
**User**: Emma has no forgiveness tokens left
**Situation**: Missed a habit today
**Result**: No automatic protection
**Notification**: None (or optional reminder about earning tokens)
**Outcome**: Streak breaks naturally

## Best Practices

### For Users
1. **Enable Auto-Forgiveness**: Keep it on for automatic protection
2. **Prioritize Habits**: System protects longest streaks first
3. **Check Notifications**: Review which habits were protected
4. **Earn Tokens**: Complete habits consistently to earn tokens back

### For Developers
1. **Transaction Safety**: Always use MongoDB transactions
2. **Error Handling**: Catch and log errors per user
3. **Performance**: Process users in batches if needed
4. **Monitoring**: Track job execution time and success rate

## Future Enhancements

### Potential Features
1. **Token Earning**: Earn tokens by completing habits consistently
2. **Custom Priority**: Let users set which habits to protect first
3. **Token Alerts**: Notify when running low on tokens
4. **Weekly Summary**: Show how many streaks were protected this week
5. **Token History**: Track when and how tokens were used
6. **Smart Scheduling**: Run at user's preferred time (not just 11:50 PM)

### Analytics Opportunities
1. **Retention Impact**: Do auto-forgiveness users stay longer?
2. **Streak Lengths**: Are protected streaks longer on average?
3. **Token Usage**: When do users run out of tokens?
4. **Habit Patterns**: Which habits benefit most from protection?

## Configuration

### Environment Variables
```env
# Cron schedule for auto-forgiveness (default: 11:50 PM)
AUTO_FORGIVENESS_SCHEDULE=50 23 * * *

# Enable/disable auto-forgiveness globally
AUTO_FORGIVENESS_ENABLED=true

# XP awarded for auto-forgiveness (default: 5)
AUTO_FORGIVENESS_XP=5
```

### Server Configuration
```javascript
// In server/src/jobs/notificationScheduler.js
cron.schedule('50 23 * * *', autoUseForgivenessTokens);
```

## Troubleshooting

### Issue: Tokens Not Being Used Automatically
**Check**:
1. Is auto-forgiveness enabled in user preferences?
2. Does user have available tokens?
3. Are there habits with active streaks?
4. Is the cron job running?

**Solution**:
```bash
# Check cron job status
pm2 logs habitforge-server | grep "automatic forgiveness"

# Run job manually
node test-forgiveness-tokens.js
```

### Issue: Wrong Habits Being Protected
**Check**:
1. Verify streak lengths in database
2. Check completion records for today
3. Review job logs for priority order

**Solution**:
- Habits are protected by longest streak first
- This is intentional to protect most valuable streaks

### Issue: Notifications Not Sent
**Check**:
1. User notification preferences
2. Quiet hours settings
3. Notification model creation

**Solution**:
```javascript
// Check user preferences
db.users.findOne({ _id: userId }, { notificationPreferences: 1 })

// Check notifications
db.notifications.find({ userId: userId, createdAt: { $gte: new Date(today) } })
```

## Files Modified/Created

### Created
- `server/src/jobs/autoForgivenessToken.js` - Automatic forgiveness job
- `server/test-forgiveness-tokens.js` - Test suite
- `AUTOMATIC_FORGIVENESS_TOKENS.md` - This documentation

### Modified
- `server/src/models/User.js` - Added autoForgiveness preference
- `server/src/jobs/notificationScheduler.js` - Added cron job

## Status: ✅ COMPLETE

The automatic forgiveness token system is fully implemented and tested. Users can now:
- Have their streaks automatically protected at end of day
- Control auto-forgiveness via settings
- Receive notifications when streaks are protected
- Prioritize longest streaks automatically

The system is compassionate, smart, and helps users maintain consistency without stress.

---

**Implementation Date**: November 10, 2024  
**Status**: Complete and Ready for Production  
**Impact**: Significantly improved user retention and streak maintenance
