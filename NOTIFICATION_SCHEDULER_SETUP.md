# Notification Scheduler Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

This will install the required packages:
- `node-cron` - For scheduling jobs
- `date-fns` - For date manipulation
- `date-fns-tz` - For timezone handling

### 2. Start the Server
```bash
npm run dev
```

The notification scheduler will automatically initialize when the server starts. You should see:
```
✅ All background jobs initialized
```

### 3. Test the Notifications
```bash
npm run test:notifications
```

This will manually trigger all notification types and create test notifications in your database.

## Notification Schedule

Once the server is running, notifications will be sent automatically:

| Notification Type | Schedule | Description |
|------------------|----------|-------------|
| 🎯 Habit Reminders | Every minute | Checks for habits with matching reminder times |
| 🔥 Streak Milestones | Every hour | Celebrates streak achievements |
| 📊 Daily Summary | 9:00 PM daily | End-of-day habit summary |
| 📈 Weekly Insights | Monday 9:00 AM | Weekly performance analysis |
| 🏆 Challenge Updates | 9:00 AM & 9:00 PM | Active challenge progress |
| 👥 Community Activity | 9:00 AM & 9:00 PM | Community circle updates |
| ⚙️ System Updates | Manual trigger | Important system announcements |
| 💡 Tips & Tricks | 9:00 AM & 9:00 PM | Helpful habit-building tips |

## User Preferences

Users can control which notifications they receive in Settings → Notifications:

### Notification Channels
- Push Notifications (future)
- Email Notifications (future)
- In-App Notifications ✅

### Individual Notification Types
Each notification type can be toggled on/off individually.

### Quiet Hours
Users can set quiet hours (default: 10:00 PM - 8:00 AM) to pause notifications during sleep or focus time.

## How It Works

### 1. Habit Reminders
- Checks every minute for habits with reminder times
- Only sends if habit is NOT completed today
- Respects user's timezone
- Example: "🎯 Time for your habit! Don't forget to complete 'Morning Exercise' today!"

### 2. Streak Milestones
- Checks every hour for milestone streaks (7, 14, 30, 60, 90, 180, 365 days)
- Prevents duplicate notifications
- Example: "🔥 30-Day Streak! Amazing! You've maintained 'Reading' for 30 days straight!"

### 3. Daily Summary
- Sent at 9:00 PM every day
- Calculates completion rate
- Provides encouraging feedback
- Example: "📊 Your Daily Summary: You completed 3 out of 5 habits today (60%). Keep it up!"

### 4. Weekly Insights
- Sent every Monday at 9:00 AM
- Analyzes past week's performance
- Identifies best performing habit
- Example: "📈 Your Weekly Insights: This week you completed 28 habits with a 80% completion rate."

### 5. Challenge Updates
- Sent twice daily (9 AM & 9 PM)
- Updates on personal and community challenges
- Shows days remaining
- Example: "🏆 Challenge Progress Update: You have 2 active challenge(s). 5 days left!"

### 6. Community Activity
- Sent twice daily (9 AM & 9 PM)
- Summarizes community circle activity
- Counts messages, announcements, new members
- Example: "👥 Community Activity: Your community has been active! 12 new message(s), 2 new announcement(s)"

### 7. System Updates
- Manually triggered by admins
- Important announcements
- Reaches all active users
- Example: "⚙️ New Feature Available: Check out our new community challenges feature!"

### 8. Tips & Tricks
- Sent twice daily (9 AM & 9 PM)
- Random helpful tips from curated list
- Educational content
- Example: "💡 Tip of the Day: Start small! Building a habit is easier when you begin with just 2 minutes a day."

## Verification

### Check Notifications in Database
```bash
# Connect to MongoDB
mongosh

# Use your database
use habitforge

# View recent notifications
db.notifications.find().sort({createdAt: -1}).limit(10).pretty()

# Count notifications by type
db.notifications.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
])
```

### Check Server Logs
The server logs will show when each job runs:
```
Running habit reminders job...
Habit reminders job completed

Running streak milestones job...
Streak milestones job completed

Running daily summary job...
Daily summary job completed
```

## Troubleshooting

### Notifications Not Appearing

1. **Check User Preferences**
   - Ensure in-app notifications are enabled
   - Ensure specific notification type is enabled
   - Check if quiet hours are blocking notifications

2. **Check Server Logs**
   - Look for error messages in console
   - Verify cron jobs are running
   - Check database connection

3. **Check Database**
   - Verify notifications are being created
   - Check notification timestamps
   - Verify userId matches

### Wrong Timing

1. **Check Server Timezone**
   ```bash
   date
   ```

2. **Check User Timezone**
   - Verify user.timezone in database
   - Should match user's actual timezone

3. **Check Cron Schedule**
   - Verify cron syntax in notificationScheduler.js
   - Test with different schedules

### Performance Issues

1. **Monitor Job Execution**
   - Check console logs for execution times
   - Look for slow database queries

2. **Optimize Queries**
   - Add database indexes if needed
   - Use projection to limit fields

3. **Batch Processing**
   - Process users in smaller batches
   - Add delays between batches if needed

## Manual Triggers

You can manually trigger any notification job from code:

```javascript
import notificationScheduler from './src/jobs/notificationScheduler.js';

// Send habit reminders now
await notificationScheduler.sendHabitReminders();

// Send daily summary now
await notificationScheduler.sendDailySummary();

// Send system update to all users
await notificationScheduler.sendSystemUpdate(
  'Maintenance Notice',
  'We will be performing maintenance tonight from 2-4 AM EST.'
);
```

## Development Tips

### Testing Specific Times

To test notifications at specific times without waiting:

1. **Temporarily modify cron schedule**
   ```javascript
   // Test daily summary every minute instead of 9 PM
   cron.schedule('* * * * *', sendDailySummary);
   ```

2. **Use manual triggers**
   ```bash
   npm run test:notifications
   ```

3. **Adjust user timezone**
   - Temporarily change user timezone in database
   - Test notifications at different times

### Adding New Notification Types

1. Create notification function in `notificationScheduler.js`
2. Add cron schedule in `initializeNotificationScheduler()`
3. Add preference field to User model
4. Add toggle in NotificationSettings component
5. Update documentation

## Production Considerations

### Monitoring
- Set up logging service (e.g., Winston, Loggly)
- Monitor notification delivery rates
- Track job execution times
- Alert on failures

### Scaling
- Use message queues for large user bases (Redis, RabbitMQ)
- Implement worker processes
- Add rate limiting per user
- Use database sharding for notifications

### Backup
- Regular database backups
- Store notification templates
- Keep audit logs

## Support

For issues or questions:
1. Check server logs
2. Review this documentation
3. Check AUTOMATED_NOTIFICATIONS_SYSTEM.md for detailed technical info
4. Test with `npm run test:notifications`

## Next Steps

1. ✅ Install dependencies
2. ✅ Start server
3. ✅ Test notifications
4. ✅ Verify in database
5. ✅ Configure user preferences
6. ✅ Monitor logs
7. 🚀 Deploy to production

Happy notifying! 🔔
