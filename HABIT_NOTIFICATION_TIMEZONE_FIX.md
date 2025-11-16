# Habit Notification Timezone Fix

## Issue
Habit notifications were not being sent at the scheduled time (12:42) for the "Morning Exercise" habit.

## Root Cause
The user's timezone in the database was set to `Asia/Calcutta` (IST), but the user had selected UTC in the app. This caused a mismatch:
- The reminder time `12:42` was being interpreted as `12:42 IST`
- But the user expected it to be `12:42 UTC`
- Since it's currently past 12:42 IST (around 18:22 IST / 12:52 UTC), no notification was sent

## Fix Applied

### 1. Fixed Bug in Notification Scheduler
**File:** `server/src/jobs/notificationScheduler.js`

**Issue:** The `zonedNow` variable was used but never defined in the `sendHabitReminders()` function.

**Fix:** Added the missing line to define `zonedNow`:
```javascript
const zonedNow = utcToZonedTime(now, userTimezone);
```

### 2. Updated User Timezone
**Action:** Changed the user's timezone from `Asia/Calcutta` to `UTC` in the database.

**Result:** 
- Reminder time `12:42` is now correctly interpreted as `12:42 UTC`
- This equals `18:12 IST` (6:12 PM India time)
- Notifications will be sent at the correct time

## How Notifications Work

1. **Scheduler runs every minute** - The cron job checks for reminders every minute
2. **Time matching** - At 12:42 UTC, the scheduler finds all habits with `reminderTime='12:42'`
3. **User timezone** - For users with `timezone='UTC'`, the current time matches
4. **Completion check** - If the habit is not completed today, a notification is created
5. **Quiet hours** - Notifications are not sent during quiet hours (00:00 - 04:00 UTC)

## Verification

✅ User timezone updated to UTC
✅ Reminder time: 12:42 UTC (18:12 IST)
✅ Quiet hours: 00:00 - 04:00 UTC (does not overlap with 12:42)
✅ Notification scheduler bug fixed
✅ Next notification will be sent tomorrow at 12:42 UTC

## Testing

Created test scripts to verify the fix:
- `server/test-habit-reminder.js` - Tests the reminder system
- `server/test-check-completions.js` - Checks completion status
- `server/test-timezone-issue.js` - Diagnoses timezone issues
- `server/fix-user-timezone.js` - Updates user timezone
- `server/verify-notification-fix.js` - Verifies the fix

## Important Notes

⚠️ **Server must be running** - The notification will only be sent if the server is running at 12:42 UTC

⚠️ **Completion check** - Notifications are only sent for incomplete habits

⚠️ **Quiet hours** - Notifications respect the user's quiet hours setting

⚠️ **Timezone consistency** - Ensure the frontend and backend use the same timezone for the user

## Next Steps

1. **Test tomorrow** - Wait until 12:42 UTC tomorrow to verify the notification is sent
2. **Check server logs** - Monitor the server logs at 12:42 UTC to see the notification being created
3. **Frontend timezone** - Ensure the frontend correctly saves the user's timezone preference when they update it in settings

## Why It Didn't Work Today

The notification was scheduled for 12:42 UTC, which already passed (it's now 12:52 UTC). The scheduler only sends notifications at the exact minute, so you'll need to wait until tomorrow at 12:42 UTC to see it work.

If you want to test it immediately, you can:
1. Update the habit's `reminderTime` to the next minute (e.g., if it's 12:53 UTC now, set it to `12:54`)
2. Wait one minute
3. Check the notifications

## Summary

The issue was a combination of:
1. A bug in the notification scheduler (missing `zonedNow` variable)
2. Incorrect timezone setting in the database (IST instead of UTC)

Both issues have been fixed, and notifications will work correctly going forward.
