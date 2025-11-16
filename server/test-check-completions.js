import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Habit, Completion, Notification } from './src/models/index.js';
import { startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const checkCompletions = async () => {
  try {
    console.log('🔍 Checking Morning Exercise habit status...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      process.exit(1);
    }

    const habit = await Habit.findOne({ 
      userId: user._id, 
      name: 'Morning Exercise'
    });

    if (!habit) {
      console.log('❌ Morning Exercise habit not found');
      process.exit(1);
    }

    console.log(`📝 Habit: ${habit.icon} ${habit.name}`);
    console.log(`⏰ Reminder Time: ${habit.reminderTime}`);
    console.log(`🔔 Reminder Enabled: ${habit.reminderEnabled !== false}\n`);

    // Check today's completions
    const userTimezone = user.timezone || 'UTC';
    const now = new Date();
    const zonedNow = utcToZonedTime(now, userTimezone);
    const todayStart = startOfDay(zonedNow);
    const todayEnd = endOfDay(zonedNow);

    console.log(`📅 Checking completions for today:`);
    console.log(`   Start: ${todayStart.toLocaleString()}`);
    console.log(`   End: ${todayEnd.toLocaleString()}\n`);

    const completion = await Completion.findOne({
      habitId: habit._id,
      completedAt: {
        $gte: todayStart,
        $lte: todayEnd
      }
    });

    if (completion) {
      console.log(`✅ Habit was completed today at: ${completion.completedAt.toLocaleString()}`);
      console.log(`   This would prevent a reminder notification.\n`);
    } else {
      console.log(`❌ Habit was NOT completed today.\n`);
    }

    // Check for notifications sent today
    const notifications = await Notification.find({
      userId: user._id,
      type: 'habit_reminder',
      'metadata.habitId': habit._id,
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd
      }
    }).sort({ createdAt: -1 });

    console.log(`📬 Notifications sent today: ${notifications.length}`);
    if (notifications.length > 0) {
      notifications.forEach(notif => {
        console.log(`   ${notif.title}`);
        console.log(`   ${notif.message}`);
        console.log(`   Sent at: ${notif.createdAt.toLocaleString()}`);
        console.log(`   Read: ${notif.read}\n`);
      });
    } else {
      console.log(`   No notifications were sent for this habit today.`);
      console.log(`   \n   🤔 Possible reasons:`);
      console.log(`   1. The server wasn't running at 12:42`);
      console.log(`   2. The habit was already completed before 12:42`);
      console.log(`   3. Quiet hours were active at 12:42`);
      console.log(`   4. There was an error in the scheduler`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Check complete');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkCompletions();
