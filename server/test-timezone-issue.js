import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Habit } from './src/models/index.js';
import { formatInTimeZone } from 'date-fns-tz';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const checkTimezone = async () => {
  try {
    console.log('🌍 Checking Timezone Configuration...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      process.exit(1);
    }

    console.log(`📋 User: ${user.name}`);
    console.log(`🌍 User Timezone Setting: ${user.timezone || 'UTC'}\n`);

    const now = new Date();
    console.log(`⏰ Current Times:`);
    console.log(`   Server (local): ${now.toLocaleString()}`);
    console.log(`   UTC: ${formatInTimeZone(now, 'UTC', 'yyyy-MM-dd HH:mm:ss')}`);
    console.log(`   IST (Asia/Kolkata): ${formatInTimeZone(now, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss')}`);
    console.log(`   User's timezone (${user.timezone || 'UTC'}): ${formatInTimeZone(now, user.timezone || 'UTC', 'yyyy-MM-dd HH:mm:ss')}\n`);

    const habit = await Habit.findOne({ 
      userId: user._id, 
      name: 'Morning Exercise'
    });

    if (habit) {
      console.log(`📝 Morning Exercise Habit:`);
      console.log(`   Reminder Time: ${habit.reminderTime}`);
      console.log(`   This time is interpreted in: ${user.timezone || 'UTC'}\n`);

      const currentTimeInUserTZ = formatInTimeZone(now, user.timezone || 'UTC', 'HH:mm');
      console.log(`🔍 Comparison:`);
      console.log(`   Current time in user TZ: ${currentTimeInUserTZ}`);
      console.log(`   Habit reminder time: ${habit.reminderTime}`);
      console.log(`   Match: ${currentTimeInUserTZ === habit.reminderTime ? '✅ YES' : '❌ NO'}\n`);

      if (user.timezone === 'Asia/Calcutta' || user.timezone === 'Asia/Kolkata') {
        console.log(`⚠️  ISSUE FOUND:`);
        console.log(`   User timezone is set to IST (${user.timezone})`);
        console.log(`   But you mentioned the user selected UTC in the app`);
        console.log(`   The reminder time 12:42 is being interpreted as 12:42 IST`);
        console.log(`   But you want it to be 12:42 UTC\n`);
        
        console.log(`💡 Solution:`);
        console.log(`   Update user timezone to 'UTC' in the database`);
        console.log(`   OR ensure the frontend sends the correct timezone when creating habits\n`);
      }
    }

    await mongoose.disconnect();
    console.log('✅ Check complete');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkTimezone();
