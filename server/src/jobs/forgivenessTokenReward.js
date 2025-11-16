import cron from 'node-cron';
import { User, Habit, Completion } from '../models/index.js';
import { startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

/**
 * Forgiveness Token Reward System
 * Awards 1 token per day when user completes all their habits
 * Maximum 3 tokens can be stacked
 */

export const awardForgivenessTokens = async () => {
  console.log('Running forgiveness token reward job...');

  try {
    const users = await User.find({ isActive: true, softDeleted: false });

    for (const user of users) {
      // Skip if user already has max tokens
      if (user.forgivenessTokens >= 3) {
        continue;
      }

      const userTimezone = user.timezone || 'UTC';
      const now = new Date();
      const zonedNow = utcToZonedTime(now, userTimezone);
      const todayStart = startOfDay(zonedNow);
      const todayEnd = endOfDay(zonedNow);

      // Get user's active habits
      const habits = await Habit.find({ userId: user._id, isActive: true });

      // Skip if user has no habits
      if (habits.length === 0) {
        continue;
      }

      // Get today's completions
      const completions = await Completion.find({
        habitId: { $in: habits.map(h => h._id) },
        completedAt: { $gte: todayStart, $lte: todayEnd }
      });

      // Check if all habits are completed
      const completedHabitIds = new Set(completions.map(c => c.habitId.toString()));
      const allHabitsCompleted = habits.every(h => completedHabitIds.has(h._id.toString()));

      if (allHabitsCompleted) {
        // Award 1 forgiveness token (up to max of 3)
        const newTokenCount = Math.min(user.forgivenessTokens + 1, 3);
        
        // Only update if we're actually adding a token
        if (newTokenCount > user.forgivenessTokens) {
          user.forgivenessTokens = newTokenCount;
          await user.save();
          
          console.log(`Awarded forgiveness token to user ${user._id}. New count: ${newTokenCount}/3`);
        }
      }
    }

    console.log('Forgiveness token reward job completed');
  } catch (error) {
    console.error('Error in forgiveness token reward job:', error);
  }
};

/**
 * Initialize forgiveness token reward scheduler
 * Runs once per day at midnight to check previous day's completions
 */
export const initializeForgivenessTokenReward = () => {
  console.log('Initializing forgiveness token reward scheduler...');

  // Run at midnight every day (00:01 AM)
  cron.schedule('1 0 * * *', awardForgivenessTokens);

  console.log('Forgiveness token reward scheduler initialized');
};

export default {
  initializeForgivenessTokenReward,
  awardForgivenessTokens
};
