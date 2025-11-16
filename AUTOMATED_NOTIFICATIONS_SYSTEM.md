# Automated Notifications System

## Overview
Comprehensive automated notification system that sends in-app notifications for all major features in HabitForge based on user preferences and scheduled times.

## Features Implemented

### 1. 🎯 Habit Reminders
**Schedule**: Every minute (checks for matching reminder times)
**Logic**:
- Checks each user's habits for reminder times
- Only sends if habit has a `reminderTime` set
- Only sends if habit is NOT completed today
- Respects user's timezone
- Respects quiet hours

**Example Notification**:
```
Title: "🎯 Time for your habit!"
Message: "Don't forget to complete 'Morning Exercise' today!"
```

### 2. 🔥 Streak Milestones
**Schedule**: Every hour
**Milestones**: 7, 14, 30, 60, 90, 180, 365 days
**Logic**:
- Checks all active habits for milestone streaks
- Sends notification when streak matches a milestone
- Prevents duplicate notifications (checks last 24 hours)
- Celebrates user achievements

**Example Notification**:
```
Title: "🔥 30-Day Streak!"
Message: "Amazing! You've maintained 'Reading' for 30 days straight!"
```

### 3. 📊 Daily Summary
**Schedule**: 9:00 PM every day
**Logic**:
- Calculates today's habit completions
- Computes completion rate
- Provides encouraging feedback based on performance
- Respects quiet hours

**Example Notifications**:
```
Perfect day: "Perfect day! You completed all 5 habits! 🎉"
Partial: "You completed 3 out of 5 habits today (60%). Keep it up!"
None: "You didn't complete any habits today. Tomorrow is a new opportunity!"
```

### 4. 📈 Weekly Insights
**Schedule**: Every Monday at 9:00 AM
**Logic**:
- Analyzes the past week's performance
- Calculates weekly completion rate
- Identifies best performing habit
- Provides motivational insights

**Example Notification**:
```
Title: "📈 Your Weekly Insights"
Message: "This week you completed 28 habits with a 80% completion rate. Your star habit was 'Meditation' with 7 completions!"
```

### 5. 🏆 Challenge Updates
**Schedule**: 9:00 AM and 9:00 PM daily
**Logic**:
- Checks for active personal challenges
- Checks for active community challenges
- Calculates days remaining
- Sends motivational updates

**Example Notifications**:
```
Personal: "You have 2 active challenge(s). 5 days left to complete your current challenge!"
Community: "You have 3 active community challenge(s). Keep pushing!"
```

### 6. 👥 Community Activity
**Schedule**: 9:00 AM and 9:00 PM daily
**Logic**:
- Tracks activity in user's community circles
- Counts new messages (last 24 hours)
- Counts new announcements
- Counts new members
- Only sends if there's activity

**Example Notification**:
```
Title: "👥 Community Activity"
Message: "Your community has been active! 12 new message(s), 2 new announcement(s), 1 new member(s)"
```

### 7. ⚙️ System Updates
**Schedule**: Manual trigger or scheduled
**Logic**:
- Sends important system-wide announcements
- Can be triggered programmatically
- Reaches all active users
- Used for maintenance, new features, etc.

**Example Notification**:
```
Title: "⚙️ New Feature Available"
Message: "Check out our new community challenges feature! Join a circle to get started."
```

### 8. 💡 Tips & Tricks
**Schedule**: 9:00 AM and 9:00 PM daily
**Logic**:
- Sends random helpful tips from curated list
- Helps users improve their habit-building journey
- Educational and motivational content

**Example Notification**:
```
Title: "💡 Tip of the Day"
Message: "Start small! Building a habit is easier when you begin with just 2 minutes a day."
```

## Technical Implementation

### Cron Schedule Summary
```javascript
// Habit reminders - Every minute
'* * * * *' → sendHabitReminders()

// Streak milestones - Every hour
'0 * * * *' → checkStreakMilestones()

// Daily summary - 9 PM daily
'0 21 * * *' → sendDailySummary()

// Weekly insights - Monday 9 AM
'0 9 * * 1' → sendWeeklyInsights()

// Challenge updates - 9 AM and 9 PM
'0 9,21 * * *' → sendChallengeUpdates()

// Community activity - 9 AM and 9 PM
'0 9,21 * * *' → sendCommunityActivity()

// Tips & Tricks - 9 AM and 9 PM
'0 9,21 * * *' → sendTipsAndTricks()
```

### User Preference Checks

Every notification respects:
1. **User Preference**: Checks if notification type is enabled
2. **In-App Enabled**: Checks if in-app notifications are enabled
3. **Quiet Hours**: Respects user's quiet hours settings
4. **Active Status**: Only sends to active, non-deleted users

### Quiet Hours Logic
```javascript
// Example: Quiet hours from 22:00 to 08:00
- If current time is between 22:00 and 08:00 (user's timezone)
- Skip sending notification
- Handles overnight periods correctly
```

### Timezone Handling
- All times are converted to user's timezone
- Uses `date-fns-tz` for accurate timezone conversions
- Defaults to UTC if timezone not set
- Ensures notifications arrive at appropriate local times

## Database Schema

### Notification Model
```javascript
{
  userId: ObjectId,
  type: String, // 'habit_reminder', 'streak_milestone', etc.
  title: String,
  message: String,
  metadata: Object, // Additional context data
  read: Boolean,
  createdAt: Date
}
```

### User Notification Preferences
```javascript
notificationPreferences: {
  inApp: Boolean,
  habitReminders: Boolean,
  streakMilestones: Boolean,
  dailySummary: Boolean,
  weeklyInsights: Boolean,
  challengeUpdates: Boolean,
  communityActivity: Boolean,
  systemUpdates: Boolean,
  tipsAndTricks: Boolean,
  quietHours: {
    enabled: Boolean,
    start: String, // "22:00"
    end: String    // "08:00"
  }
}
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd server
npm install node-cron date-fns date-fns-tz
```

### 2. Server Integration
The notification scheduler is automatically initialized when the server starts:
```javascript
// server/src/server.js
import { initializeNotificationScheduler } from './jobs/notificationScheduler.js';

app.listen(PORT, () => {
  initializeNotificationScheduler();
});
```

### 3. Manual Triggers
You can manually trigger any notification job:
```javascript
import notificationScheduler from './jobs/notificationScheduler.js';

// Send system update to all users
await notificationScheduler.sendSystemUpdate(
  'Maintenance Notice',
  'We will be performing maintenance tonight from 2-4 AM EST.'
);

// Manually trigger daily summary
await notificationScheduler.sendDailySummary();
```

## Notification Flow

```
┌─────────────────┐
│  Cron Scheduler │
└────────┬────────┘
         │
         ├──> Check User Preferences
         │    ├─> Is notification type enabled?
         │    ├─> Is in-app enabled?
         │    └─> Is within quiet hours?
         │
         ├──> Fetch Relevant Data
         │    ├─> User habits
         │    ├─> Completions
         │    ├─> Challenges
         │    └─> Community data
         │
         ├──> Apply Business Logic
         │    ├─> Calculate metrics
         │    ├─> Check conditions
         │    └─> Generate message
         │
         └──> Create Notification
              ├─> Save to database
              ├─> User sees in notification bell
              └─> Can be marked as read
```

## Performance Considerations

### Optimization Strategies
1. **Batch Processing**: Process users in batches to avoid memory issues
2. **Indexing**: Database indexes on userId, type, createdAt
3. **Caching**: Cache frequently accessed data
4. **Async Operations**: All notification creation is asynchronous
5. **Error Handling**: Individual user failures don't stop the job

### Monitoring
- Console logs for each job execution
- Error logging for failed notifications
- Track notification delivery rates
- Monitor job execution times

## Testing

### Manual Testing
```bash
# Test habit reminders
node -e "import('./src/jobs/notificationScheduler.js').then(m => m.sendHabitReminders())"

# Test daily summary
node -e "import('./src/jobs/notificationScheduler.js').then(m => m.sendDailySummary())"

# Test system update
node -e "import('./src/jobs/notificationScheduler.js').then(m => m.sendSystemUpdate('Test', 'This is a test'))"
```

### Integration Testing
1. Create test users with different preferences
2. Create test habits with various reminder times
3. Verify notifications are created correctly
4. Check quiet hours are respected
5. Validate timezone handling

## Future Enhancements

### Potential Improvements
1. **Email Notifications**: Extend to send emails
2. **Push Notifications**: Add mobile push support
3. **SMS Notifications**: Add SMS option for critical reminders
4. **Smart Timing**: AI-powered optimal notification times
5. **Notification Batching**: Group similar notifications
6. **Priority Levels**: Urgent vs normal notifications
7. **Snooze Feature**: Allow users to snooze reminders
8. **Custom Messages**: Let users customize notification text
9. **Notification History**: View past notifications
10. **Analytics Dashboard**: Track notification engagement

### Scalability
For large user bases:
- Implement message queues (Redis, RabbitMQ)
- Use worker processes for notification generation
- Implement rate limiting per user
- Add notification throttling
- Use database sharding for notifications

## Troubleshooting

### Common Issues

**Notifications not sending**
- Check if cron jobs are running: `console.log` in job functions
- Verify user preferences are set correctly
- Check database connection
- Verify timezone settings

**Wrong timing**
- Verify server timezone settings
- Check user timezone in database
- Validate cron schedule syntax
- Test with different timezones

**Duplicate notifications**
- Check for duplicate cron job initialization
- Verify notification deduplication logic
- Check database indexes

**Performance issues**
- Monitor job execution times
- Check database query performance
- Add indexes if needed
- Consider batch processing

## Security Considerations

1. **Data Privacy**: Only send notifications to authorized users
2. **Rate Limiting**: Prevent notification spam
3. **Input Validation**: Sanitize all notification content
4. **Access Control**: Restrict manual trigger endpoints
5. **Audit Logging**: Log all notification activities

## Conclusion

The automated notifications system provides comprehensive, timely, and personalized notifications to users based on their preferences and activity. With 8 different notification types, timezone support, quiet hours, and user preference controls, it creates an engaging and non-intrusive user experience.

All notifications respect user preferences and quiet hours, ensuring users only receive notifications they want, when they want them.
