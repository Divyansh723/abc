import User from '../models/User.js';
import Habit from '../models/Habit.js';
import Completion from '../models/Completion.js';
import XPTransaction from '../models/XPTransaction.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

/**
 * Automatic Forgiveness Token Job
 * Runs at 11:50 PM daily to automatically use forgiveness tokens for missed habits
 * Only uses tokens if:
 * 1. User has available tokens
 * 2. Habit was not completed today
 * 3. Habit has an active streak (> 0)
 * 4. User has auto-forgiveness enabled (default: true)
 */

const calculateLevel = (totalXP) => {
  const XP_BASE = 100;
  const XP_MULTIPLIER = 1.2;
  const roundToNearestTen = (value) => Math.round(value / 10) * 10;
  
  let level = 1;
  let accumulatedXP = 0;
  let xpForNextLevel = XP_BASE;
  
  while (totalXP >= accumulatedXP + xpForNextLevel) {
    accumulatedXP += xpForNextLevel;
    level++;
    xpForNextLevel = roundToNearestTen(XP_BASE * Math.pow(XP_MULTIPLIER, level - 1));
  }
  
  return level;
};

export const autoUseForgivenessTokens = async () => {
  const startTime = Date.now();
  logger.info('Starting automatic forgiveness token job...');

  try {
    // Get all active users with forgiveness tokens and auto-forgiveness enabled
    const users = await User.find({
      forgivenessTokens: { $gt: 0 },
      isActive: true,
      softDeleted: false,
      'notificationPreferences.autoForgiveness': { $ne: false } // Default is true
    });

    logger.info(`Found ${users.length} users with available forgiveness tokens`);

    let tokensUsed = 0;
    let habitsProtected = 0;
    let notificationsSent = 0;

    for (const user of users) {
      const session = await mongoose.startSession();
      
      try {
        await session.withTransaction(async () => {
          // Get user's active habits with streaks
          const habits = await Habit.find({
            userId: user._id,
            active: true,
            currentStreak: { $gt: 0 } // Only protect habits with active streaks
          }).session(session);

          if (habits.length === 0) {
            logger.info(`User ${user._id} has no habits with active streaks`);
            return;
          }

          // Get today's date range
          const today = new Date();
          const startOfDay = new Date(today);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(today);
          endOfDay.setHours(23, 59, 59, 999);

          // Get today's completions for this user
          const todayCompletions = await Completion.find({
            userId: user._id,
            completedAt: {
              $gte: startOfDay,
              $lte: endOfDay
            }
          }).session(session);

          const completedHabitIds = new Set(
            todayCompletions.map(c => c.habitId.toString())
          );

          // Find habits that need forgiveness
          const habitsNeedingForgiveness = habits.filter(
            habit => !completedHabitIds.has(habit._id.toString())
          );

          if (habitsNeedingForgiveness.length === 0) {
            logger.info(`User ${user._id} completed all habits today`);
            return;
          }

          logger.info(`User ${user._id} has ${habitsNeedingForgiveness.length} habits needing forgiveness`);

          // Sort by streak length (protect longest streaks first)
          habitsNeedingForgiveness.sort((a, b) => b.currentStreak - a.currentStreak);

          const protectedHabits = [];
          let tokensAvailable = user.forgivenessTokens;

          // Use tokens for habits (prioritize longest streaks)
          for (const habit of habitsNeedingForgiveness) {
            if (tokensAvailable <= 0) break;

            // Create forgiveness completion
            const completion = new Completion({
              habitId: habit._id,
              userId: user._id,
              completedAt: today,
              deviceTimezone: user.timezone || 'UTC',
              xpEarned: 5, // Less XP for auto-forgiveness
              forgivenessUsed: true,
              editedFlag: true
            });
            await completion.save({ session });

            // Create XP transaction
            const xpTransaction = new XPTransaction({
              userId: user._id,
              habitId: habit._id,
              amount: 5,
              source: 'habit_completion',
              description: `Auto-forgiveness: ${habit.name}`,
              metadata: {
                autoForgiveness: true,
                streakProtected: habit.currentStreak
              }
            });
            await xpTransaction.save({ session });

            // Update user XP
            user.totalXP += 5;
            user.level = calculateLevel(user.totalXP);

            // Deduct token
            tokensAvailable--;
            
            protectedHabits.push({
              name: habit.name,
              streak: habit.currentStreak
            });

            tokensUsed++;
            habitsProtected++;

            logger.info(`Protected habit "${habit.name}" (${habit.currentStreak}-day streak) for user ${user._id}`);
          }

          // Update user's token count
          user.forgivenessTokens = tokensAvailable;
          await user.save({ session });

          // Send notification if any habits were protected
          if (protectedHabits.length > 0) {
            const habitsList = protectedHabits
              .map(h => `${h.name} (${h.streak}-day streak)`)
              .join(', ');

            const notification = new Notification({
              userId: user._id,
              type: 'system',
              title: '🛡️ Streaks Protected!',
              message: `We automatically used ${protectedHabits.length} forgiveness token${protectedHabits.length > 1 ? 's' : ''} to protect your streaks: ${habitsList}`,
              metadata: {
                tokensUsed: protectedHabits.length,
                habitsProtected: protectedHabits,
                remainingTokens: tokensAvailable
              },
              priority: 'medium'
            });
            await notification.save({ session });
            notificationsSent++;

            logger.info(`Sent notification to user ${user._id} about ${protectedHabits.length} protected habits`);
          }
        });
      } catch (error) {
        logger.error(`Error processing user ${user._id}:`, error);
      } finally {
        await session.endSession();
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`Automatic forgiveness token job completed in ${duration}ms`);
    logger.info(`Summary: ${tokensUsed} tokens used, ${habitsProtected} habits protected, ${notificationsSent} notifications sent`);

    return {
      success: true,
      tokensUsed,
      habitsProtected,
      notificationsSent,
      duration
    };

  } catch (error) {
    logger.error('Error in automatic forgiveness token job:', error);
    throw error;
  }
};

// Export for manual testing
export default autoUseForgivenessTokens;
