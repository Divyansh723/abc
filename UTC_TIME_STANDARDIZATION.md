# UTC Time Standardization

## Overview
All dates and times in the HabitForge system are now standardized to use UTC (Coordinated Universal Time) for database storage and internal processing. This ensures consistency regardless of where the server is hosted or what timezone users are in.

## Why UTC?

1. **Consistency** - UTC provides a single, universal reference point for all time-based operations
2. **No DST Issues** - UTC doesn't observe daylight saving time, avoiding timezone shift bugs
3. **Server Independence** - Works correctly regardless of server location or timezone settings
4. **Easy Conversion** - Can be easily converted to any user's local timezone for display

## Implementation

### Database Storage

All MongoDB date fields automatically store dates in UTC:
- `timestamps: true` in Mongoose schemas stores `createdAt` and `updatedAt` in UTC
- Custom date fields like `completedAt` are stored in UTC
- JavaScript `new Date()` internally represents time in UTC

### Notification Scheduler

The notification scheduler now explicitly uses UTC time:

```javascript
// Always use UTC time to ensure consistency regardless of server location
const nowUTC = new Date();
const userTimezone = user.timezone || 'UTC';
const zonedNow = utcToZonedTime(nowUTC, userTimezone);
const currentTime = formatInTimeZone(nowUTC, userTimezone, 'HH:mm');
```

**Updated Functions:**
- `isWithinQuietHours()` - Uses UTC time, converts to user timezone
- `sendHabitReminders()` - Uses UTC time, converts to user timezone
- `sendDailySummary()` - Uses UTC time, converts to user timezone
- `sendWeeklyInsights()` - Uses UTC time, converts to user timezone
- `sendChallengeUpdates()` - Uses UTC time for all comparisons

### Habit Completions

When marking habits as complete:

```javascript
// Always use UTC time for database storage to ensure consistency
const completionDate = date ? new Date(date) : new Date();
```

The `completedAt` field is stored in UTC, and the user's timezone is stored separately in `deviceTimezone` for reference.

### Time Conversion Flow

```
User Action (Local Time)
    ↓
Frontend sends ISO string (UTC)
    ↓
Backend stores in MongoDB (UTC)
    ↓
Backend processes with user timezone
    ↓
Frontend displays in user's local time
```

## Key Files Updated

1. **server/src/jobs/notificationScheduler.js**
   - All `new Date()` calls now explicitly commented as UTC
   - Variable renamed from `now` to `nowUTC` for clarity
   - Consistent timezone conversion using `utcToZonedTime()`

2. **server/src/controllers/habitController.js**
   - Added comment clarifying UTC storage
   - `completionDate` stored in UTC

3. **server/src/controllers/gamificationController.js**
   - Forgiveness token completions use UTC

4. **server/src/models/Completion.js**
   - `completedAt` field stores UTC dates
   - `deviceTimezone` field stores user's timezone for reference

5. **server/src/models/Notification.js**
   - `timestamps: true` automatically uses UTC
   - `createdAt` and `updatedAt` in UTC

## How It Works

### Example: Habit Reminder at 12:42 UTC

1. **User sets reminder**: User in India (IST, UTC+5:30) sets reminder for "6:12 PM"
2. **Frontend converts**: Sends `12:42` with timezone `UTC`
3. **Database stores**: `reminderTime: "12:42"`, `timezone: "UTC"`
4. **Scheduler runs**: Every minute, checks current UTC time
5. **At 12:42 UTC**: 
   - Scheduler gets `nowUTC = new Date()` → 12:42 UTC
   - Converts to user timezone: `formatInTimeZone(nowUTC, 'UTC', 'HH:mm')` → "12:42"
   - Matches reminder time → Sends notification
6. **User receives**: Notification at 6:12 PM IST (12:42 UTC)

### Example: Habit Completion

1. **User completes habit**: At 3:00 PM IST (9:30 AM UTC)
2. **Frontend sends**: ISO string `2025-11-16T09:30:00.000Z`
3. **Backend receives**: `new Date("2025-11-16T09:30:00.000Z")` → UTC date
4. **Database stores**: `completedAt: 2025-11-16T09:30:00.000Z` (UTC)
5. **Frontend displays**: Converts back to IST → "3:00 PM"

## Benefits

✅ **No timezone bugs** - All calculations use UTC as reference
✅ **Server portability** - Works on any server, anywhere
✅ **User flexibility** - Each user can have their own timezone
✅ **Accurate scheduling** - Notifications sent at correct time
✅ **Consistent data** - All dates comparable and sortable
✅ **Easy debugging** - All logs show UTC time

## Testing

To verify UTC standardization:

```bash
# Test notification scheduler
node server/test-habit-reminder.js

# Test timezone handling
node server/test-timezone-issue.js

# Verify fix
node server/verify-notification-fix.js
```

## Important Notes

⚠️ **Date Strings**: When creating dates from strings, always use ISO 8601 format (e.g., `2025-11-16T12:42:00.000Z`)

⚠️ **User Timezone**: Always store user's timezone in their profile for proper conversion

⚠️ **Display**: Frontend should always convert UTC dates to user's local timezone for display

⚠️ **Comparisons**: Always compare dates in UTC to avoid timezone-related bugs

## Migration

Existing data is already in UTC (MongoDB and JavaScript Date objects use UTC internally). No migration needed.

## Summary

The system now explicitly uses UTC time throughout:
- Database storage: UTC
- Internal processing: UTC
- Scheduler: UTC with timezone conversion
- User display: Converted to user's local timezone

This ensures reliable, consistent time handling across the entire application.
