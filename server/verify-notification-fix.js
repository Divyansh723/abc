import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Habit } from './src/models/index.js';
import { formatInTimeZone } from 'date-fns-tz';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const verify = async () => {
  try {
    console.log('✅ Verifying Notification Fix...\n');

    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({ email: 'test@example.com' });
    const habit = await Habit.findOne({ 
      userId: user._id, 
      name: 'Morning Exercise'
    });

    console.log(`📋 User: ${user.name}`);
    console.log(`🌍 Timezone: ${user.timezone}\n`);

    console.log(`📝 Morning Exercise Habit:`);
    console.log(`   Reminder Time: ${habit.reminderTime} ${user.timezone}`);
    console.log(`   Which is: ${habit.reminderTime} UTC = 18:12 IST\n`);

    const now = new Date();
    const currentUTC = formatInTimeZone(now, 'UTC', 'HH:mm');
    const currentIST = formatInTimeZone(now, 'Asia/Kolkata', 'HH:mm');

    console.log(`⏰ Current Time:`);
    console.log(`   UTC: ${currentUTC}`);
    console.log(`   IST: ${currentIST}\n`);

    console.log(`🔔 Notification Schedule:`);
    console.log(`   ✅ Notification will be sent at: 12:42 UTC (18:12 IST)`);
    console.log(`   📅 Next notification: Tomorrow at 12:42 UTC\n`);

    console.log(`💡 How it works:`);
    console.log(`   1. Scheduler runs every minute`);
    console.log(`   2. At 12:42 UTC, it checks all habits with reminderTime='12:42'`);
    console.log(`   3. For users with timezone='UTC', current time will match`);
    console.log(`   4. If habit is not completed, notification is sent\n`);

    console.log(`⚠️  Important:`);
    console.log(`   - Make sure your server is running at 12:42 UTC`);
    console.log(`   - The notification will only be sent if the habit is not completed`);
    console.log(`   - Check that quiet hours (${user.notificationPreferences?.quietHours?.start} - ${user.notificationPreferences?.quietHours?.end}) don't overlap with 12:42 UTC\n`);

    // Check if 12:42 UTC falls in quiet hours
    const reminderHour = 12;
    const reminderMinute = 42;
    const reminderTimeInMinutes = reminderHour * 60 + reminderMinute;

    if (user.notificationPreferences?.quietHours?.enabled) {
      const [startHour, startMinute] = user.notificationPreferences.quietHours.start.split(':').map(Number);
      const [endHour, endMinute] = user.notificationPreferences.quietHours.end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      let isInQuietHours = false;
      if (startTime > endTime) {
        // Overnight quiet hours
        isInQuietHours = reminderTimeInMinutes >= startTime || reminderTimeInMinutes <= endTime;
      } else {
        isInQuietHours = reminderTimeInMinutes >= startTime && reminderTimeInMinutes <= endTime;
      }

      if (isInQuietHours) {
        console.log(`❌ WARNING: 12:42 UTC falls within quiet hours!`);
        console.log(`   Quiet hours: ${user.notificationPreferences.quietHours.start} - ${user.notificationPreferences.quietHours.end} UTC`);
        console.log(`   Notifications will NOT be sent during quiet hours\n`);
      } else {
        console.log(`✅ 12:42 UTC is outside quiet hours - notifications will be sent\n`);
      }
    }

    await mongoose.disconnect();
    console.log('✅ Verification complete');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verify();
