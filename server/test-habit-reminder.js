import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Habit, Notification } from './src/models/index.js';
import { sendHabitReminders } from './src/jobs/notificationScheduler.js';
import { formatInTimeZone } from 'date-fns-tz';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const testHabitReminder = async () => {
  try {
    console.log('🧪 Testing Habit Reminder System...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Get test user
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      process.exit(1);
    }

    console.log(`📋 User: ${user.name} (${user.email})`);
    console.log(`🌍 Timezone: ${user.timezone || 'UTC'}`);
    console.log(`🔔 Habit Reminders Enabled: ${user.notificationPreferences?.habitReminders !== false}`);
    console.log(`🔕 Quiet Hours: ${user.notificationPreferences?.quietHours?.enabled ? 
      `${user.notificationPreferences.quietHours.start} - ${user.notificationPreferences.quietHours.end}` : 
      'Disabled'}\n`);

    // Get current time in user's timezone
    const now = new Date();
    const userTimezone = user.timezone || 'UTC';
    const currentTime = formatInTimeZone(now, userTimezone, 'HH:mm');
    console.log(`⏰ Current time in user timezone: ${currentTime}\n`);

    // Get user's habits with reminders
    const habits = await Habit.find({ 
      userId: user._id, 
      active: true,
      reminderTime: { $exists: true, $ne: null }
    });

    console.log(`📝 Habits with reminders: ${habits.length}\n`);

    habits.forEach(habit => {
      const isTimeMatch = habit.reminderTime === currentTime;
      console.log(`  ${habit.icon} ${habit.name}`);
      console.log(`     Reminder: ${habit.reminderTime} ${isTimeMatch ? '✅ MATCH!' : ''}`);
      console.log(`     Enabled: ${habit.reminderEnabled !== false}`);
    });

    console.log('\n🚀 Running sendHabitReminders()...\n');

    // Count notifications before
    const notificationsBefore = await Notification.countDocuments({ 
      userId: user._id,
      type: 'habit_reminder'
    });

    // Run the reminder job
    await sendHabitReminders();

    // Count notifications after
    const notificationsAfter = await Notification.countDocuments({ 
      userId: user._id,
      type: 'habit_reminder'
    });

    const newNotifications = notificationsAfter - notificationsBefore;

    console.log(`\n📊 Results:`);
    console.log(`   Notifications before: ${notificationsBefore}`);
    console.log(`   Notifications after: ${notificationsAfter}`);
    console.log(`   New notifications: ${newNotifications}`);

    if (newNotifications > 0) {
      console.log('\n✅ SUCCESS! Notifications were created.');
      
      // Show the new notifications
      const recentNotifications = await Notification.find({
        userId: user._id,
        type: 'habit_reminder'
      }).sort({ createdAt: -1 }).limit(newNotifications);

      console.log('\n📬 Recent notifications:');
      recentNotifications.forEach(notif => {
        console.log(`   ${notif.title}`);
        console.log(`   ${notif.message}`);
        console.log(`   Created: ${notif.createdAt.toLocaleString()}\n`);
      });
    } else {
      console.log('\n⚠️  No new notifications created.');
      console.log('   Possible reasons:');
      console.log('   - No habits match the current time');
      console.log('   - Habits are already completed today');
      console.log('   - Quiet hours are active');
      console.log('   - Habit reminders are disabled in preferences');
    }

    await mongoose.disconnect();
    console.log('\n✅ Test complete');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testHabitReminder();
