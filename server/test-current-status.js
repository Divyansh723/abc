import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Habit, Notification } from './src/models/index.js';
import { formatInTimeZone } from 'date-fns-tz';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const checkStatus = async () => {
  try {
    console.log('🔍 Checking Current Status...\n');

    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({ email: 'test@example.com' });
    const habit = await Habit.findOne({ 
      userId: user._id, 
      name: 'Morning Exercise'
    });

    const nowUTC = new Date();
    const currentUTC = formatInTimeZone(nowUTC, 'UTC', 'HH:mm:ss');
    const currentIST = formatInTimeZone(nowUTC, 'Asia/Kolkata', 'HH:mm:ss');

    console.log(`⏰ Current Time:`);
    console.log(`   UTC: ${currentUTC}`);
    console.log(`   IST: ${currentIST}\n`);

    console.log(`📝 Morning Exercise Habit:`);
    console.log(`   Reminder Time: ${habit.reminderTime}`);
    console.log(`   User Timezone: ${user.timezone}`);
    console.log(`   Reminder Enabled: ${habit.reminderEnabled !== false}\n`);

    // Check if notification was created at 13:02
    const notifications = await Notification.find({
      userId: user._id,
      type: 'habit_reminder',
      'metadata.habitId': habit._id
    }).sort({ createdAt: -1 }).limit(5);

    console.log(`📬 Recent Habit Reminder Notifications: ${notifications.length}`);
    if (notifications.length > 0) {
      notifications.forEach(notif => {
        const createdUTC = formatInTimeZone(notif.createdAt, 'UTC', 'HH:mm:ss');
        const createdIST = formatInTimeZone(notif.createdAt, 'Asia/Kolkata', 'HH:mm:ss');
        console.log(`   - ${notif.title}`);
        console.log(`     Created: ${createdUTC} UTC (${createdIST} IST)`);
        console.log(`     Read: ${notif.read}\n`);
      });
    } else {
      console.log(`   No habit reminder notifications found.\n`);
    }

    console.log(`❓ Why no notification at 13:02 UTC?`);
    console.log(`   Possible reasons:`);
    console.log(`   1. Server wasn't running at 13:02 UTC`);
    console.log(`   2. Habit was already completed before 13:02`);
    console.log(`   3. Quiet hours were active (${user.notificationPreferences?.quietHours?.start} - ${user.notificationPreferences?.quietHours?.end} UTC)`);
    console.log(`   4. Habit reminders disabled in preferences: ${!user.notificationPreferences?.habitReminders}\n`);

    console.log(`💡 To test immediately:`);
    const nextMinute = new Date(nowUTC.getTime() + 60000);
    const nextMinuteTime = formatInTimeZone(nextMinute, 'UTC', 'HH:mm');
    console.log(`   1. Update habit reminder time to: ${nextMinuteTime}`);
    console.log(`   2. Make sure server is running`);
    console.log(`   3. Wait one minute`);
    console.log(`   4. Check for notification\n`);

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkStatus();
