import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Habit } from './src/models/index.js';
import { formatInTimeZone } from 'date-fns-tz';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const updateReminder = async () => {
  try {
    console.log('🔧 Updating Reminder Time for Testing...\n');

    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({ email: 'test@example.com' });
    const habit = await Habit.findOne({ 
      userId: user._id, 
      name: 'Morning Exercise'
    });

    const nowUTC = new Date();
    const nextMinute = new Date(nowUTC.getTime() + 120000); // 2 minutes from now
    const newReminderTime = formatInTimeZone(nextMinute, 'UTC', 'HH:mm');

    console.log(`⏰ Current Time: ${formatInTimeZone(nowUTC, 'UTC', 'HH:mm:ss')} UTC`);
    console.log(`📝 Old Reminder Time: ${habit.reminderTime}`);
    console.log(`🆕 New Reminder Time: ${newReminderTime}\n`);

    habit.reminderTime = newReminderTime;
    await habit.save();

    console.log(`✅ Updated successfully!`);
    console.log(`\n📋 Next Steps:`);
    console.log(`   1. Make sure your server is running (npm run dev in server folder)`);
    console.log(`   2. Wait until ${newReminderTime} UTC`);
    console.log(`   3. Check the notification bell in your app`);
    console.log(`   4. Check server logs for "Running habit reminders job..."`);

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateReminder();
