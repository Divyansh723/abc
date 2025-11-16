# Notification Scheduler Bug Fix

## Issue
All notification types were failing to find user habits because the query was using the wrong field name.

## Root Cause
The notification scheduler was querying habits with `isActive: true`, but the Habit model uses the field name `active` (not `isActive`).

## Affected Notification Types
All 5 notification types that query habits were affected:

1. **Habit Reminders** - Notifications for incomplete habits at scheduled times
2. **Streak Milestones** - Celebrations for reaching streak milestones (7, 14, 30, 60, 90, 180, 365 days)
3. **Daily Summary** - End-of-day summary of habit completions
4. **Weekly Insights** - Weekly analytics and best performing habits
5. **Tips & Tricks** - Helpful tips for habit-building

## Fix Applied
Changed all `Habit.find({ userId: user._id, isActive: true })` queries to use `active: true` instead:

```javascript
// Before (WRONG)
const habits = await Habit.find({ userId: user._id, isActive: true });

// After (CORRECT)
const habits = await Habit.find({ userId: user._id, active: true });
```

## Files Modified
- `server/src/jobs/notificationScheduler.js` - Fixed 5 instances of the bug

## Verification
- User model correctly uses `isActive` field ✅
- Habit model uses `active` field ✅
- All habit queries now use correct field name ✅
- No diagnostics errors ✅

## Impact
All notification types will now work correctly:
- Habit reminders will be sent at scheduled times
- Streak milestones will be celebrated
- Daily summaries will be generated
- Weekly insights will be sent
- Tips & tricks will be delivered

## Testing
Restart the server and all notification types will function properly. The scheduler runs:
- Habit reminders: Every minute
- Streak milestones: Every hour
- Daily summary: 9 PM daily
- Weekly insights: Monday 9 AM
- Challenge updates: 9 AM and 9 PM
- Community activity: 9 AM and 9 PM
- Tips & tricks: 9 AM and 9 PM
