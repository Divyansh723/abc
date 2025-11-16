# Notification System - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd server && npm install

# 2. Start server (notifications auto-start)
npm run dev

# 3. Test all notifications
npm run test:notifications
```

## 📋 Notification Types

| Icon | Type | Schedule | Description |
|------|------|----------|-------------|
| 🎯 | Habit Reminders | Every minute | Reminds to complete habits at scheduled time |
| 🔥 | Streak Milestones | Every hour | Celebrates 7, 14, 30, 60, 90, 180, 365 day streaks |
| 📊 | Daily Summary | 9 PM daily | End-of-day completion summary |
| 📈 | Weekly Insights | Mon 9 AM | Weekly performance analysis |
| 🏆 | Challenge Updates | 9 AM & 9 PM | Active challenge progress |
| 👥 | Community Activity | 9 AM & 9 PM | Community circle updates |
| ⚙️ | System Updates | Manual | Important system announcements |
| 💡 | Tips & Tricks | 9 AM & 9 PM | Helpful habit-building tips |

## 🔧 Key Features

### ✅ Smart Logic
- Only sends if user enabled that notification type
- Respects quiet hours (default: 10 PM - 8 AM)
- Timezone-aware (uses user's local time)
- Prevents duplicates
- Conditional sending (e.g., habit not completed)

### ⏰ Timing
- **Morning**: 9:00 AM
- **Evening**: 9:00 PM  
- **Habit Reminders**: User-defined time
- **Daily Summary**: 9:00 PM
- **Weekly Insights**: Monday 9:00 AM

### 🎛️ User Controls
- Toggle each notification type on/off
- Set quiet hours (start/end time)
- Configure in Settings → Notifications

## 📝 Cron Schedules

```javascript
'* * * * *'      // Every minute - Habit Reminders
'0 * * * *'      // Every hour - Streak Milestones
'0 21 * * *'     // 9 PM daily - Daily Summary
'0 9 * * 1'      // Monday 9 AM - Weekly Insights
'0 9,21 * * *'   // 9 AM & 9 PM - Challenges, Community, Tips
```

## 🧪 Testing

### Test All Notifications
```bash
npm run test:notifications
```

### Manual Trigger (in code)
```javascript
import notificationScheduler from './src/jobs/notificationScheduler.js';

// Trigger specific notification
await notificationScheduler.sendHabitReminders();
await notificationScheduler.sendDailySummary();

// Send system update to all users
await notificationScheduler.sendSystemUpdate(
  'Title',
  'Message'
);
```

### Check Database
```javascript
// View recent notifications
db.notifications.find().sort({createdAt: -1}).limit(10)

// Count by type
db.notifications.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
])

// Find user's notifications
db.notifications.find({ userId: ObjectId("...") })
```

## 🔍 Verification

### Server Logs
Look for:
```
✅ All background jobs initialized
Running habit reminders job...
Created habit_reminder notification for user...
```

### Frontend
1. Click bell icon in navbar
2. See notifications list
3. Badge shows unread count
4. Click to mark as read

### Database
```bash
mongosh
use habitforge
db.notifications.find().pretty()
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server/src/jobs/notificationScheduler.js` | Main scheduler logic |
| `server/src/server.js` | Initializes scheduler |
| `server/test-notifications-scheduler.js` | Test script |
| `src/components/settings/NotificationSettings.tsx` | User preferences UI |
| `server/src/models/User.js` | Notification preferences schema |
| `server/src/models/Notification.js` | Notification model |

## 🐛 Troubleshooting

### Notifications Not Sending
1. Check user preferences: `db.users.findOne({ _id: ObjectId("...") }).notificationPreferences`
2. Check quiet hours: Verify current time is not in quiet hours
3. Check server logs: Look for errors
4. Verify cron jobs running: Should see log messages

### Wrong Timing
1. Check user timezone: `db.users.findOne({ _id: ObjectId("...") }).timezone`
2. Verify server timezone: `date` command
3. Check cron schedule: Review `notificationScheduler.js`

### Not Appearing in UI
1. Check database: Verify notifications exist
2. Check frontend: Refresh page
3. Check notification store: Verify state management
4. Check API: Test `/api/notifications` endpoint

## 💡 Tips

### Development
- Use `npm run test:notifications` to test without waiting
- Temporarily modify cron schedules for faster testing
- Check console logs for detailed execution info

### Production
- Monitor job execution times
- Set up error alerting
- Track notification delivery rates
- Regular database backups

### Customization
- Modify cron schedules in `notificationScheduler.js`
- Add new notification types by following existing patterns
- Customize notification messages
- Add new tips to the tips array

## 📚 Full Documentation

- **AUTOMATED_NOTIFICATIONS_SYSTEM.md** - Technical details
- **NOTIFICATION_SCHEDULER_SETUP.md** - Setup guide
- **NOTIFICATION_PREFERENCES_IMPLEMENTATION.md** - User preferences
- **NOTIFICATION_SYSTEM_COMPLETE.md** - Complete summary

## ✅ Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Server running (`npm run dev`)
- [ ] Notifications tested (`npm run test:notifications`)
- [ ] Database verified (check for notifications)
- [ ] Frontend tested (click bell icon)
- [ ] User preferences configured (Settings → Notifications)
- [ ] Logs reviewed (check for errors)

## 🎯 Common Use Cases

### Send System Announcement
```javascript
await notificationScheduler.sendSystemUpdate(
  'Maintenance Notice',
  'System will be down for maintenance tonight 2-4 AM.'
);
```

### Test Habit Reminders
1. Create a habit with reminder time = current time
2. Wait 1 minute
3. Check notifications

### Test Streak Milestone
1. Set habit streak to 7, 14, or 30
2. Wait for hourly job
3. Check notifications

### Configure Quiet Hours
1. Go to Settings → Notifications
2. Enable Quiet Hours
3. Set start/end times
4. Save preferences

---

**Quick Help**: Run `npm run test:notifications` to test everything at once!
