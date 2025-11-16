import cron from 'node-cron';
import { User, Habit, Completion, Notification, CommunityCircle } from '../models/index.js';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, format } from 'date-fns';
import { utcToZonedTime, formatInTimeZone } from 'date-fns-tz';
import { autoUseForgivenessTokens } from './autoForgivenessToken.js';

/**
 * Notification Scheduler
 * Handles automated notification generation for various features
 */

// Helper function to check if current time is within quiet hours
const isWithinQuietHours = (user) => {
  if (!user.notificationPreferences?.quietHours?.enabled) {
    return false;
  }

  // Always use UTC time to ensure consistency regardless of server location
  const nowUTC = new Date();
  const userTimezone = user.timezone || 'UTC';
  const zonedNow = utcToZonedTime(nowUTC, userTimezone);
  const currentHour = zonedNow.getHours();
  const currentMinute = zonedNow.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = user.notificationPreferences.quietHours.start.split(':').map(Number);
  const [endHour, endMinute] = user.notificationPreferences.quietHours.end.split(':').map(Number);
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }

  return currentTime >= startTime && currentTime <= endTime;
};

// Helper function to check if user has notification preference enabled
const hasNotificationEnabled = (user, notificationType) => {
  if (!user.notificationPreferences?.inApp) {
    return false;
  }

  return user.notificationPreferences[notificationType] !== false;
};

// Helper function to create notification
const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      metadata,
      read: false
    });
    await notification.save();
    console.log(`Created ${type} notification for user ${userId}`);
  } catch (error) {
    console.error(`Error creating notification for user ${userId}:`, error);
  }
};

/**
 * 1. Habit Reminders
 * Send notifications for incomplete habits at their scheduled time
 */
export const sendHabitReminders = async () => {
  console.log('Running habit reminders job...');

  try {
    const users = await User.find({ isActive: true, softDeleted: false });
    console.log(`Found ${users.length} active users`);

    for (const user of users) {
      // Check if user has habit reminders enabled
      if (!hasNotificationEnabled(user, 'habitReminders')) {
        console.log(`User ${user.email}: habit reminders disabled`);
        continue;
      }

      // Check quiet hours
      if (isWithinQuietHours(user)) {
        console.log(`User ${user.email}: in quiet hours`);
        continue;
      }

      // Get user's habits
      const habits = await Habit.find({ userId: user._id, softDeleted: false });
      console.log(`User ${user.email}: found ${habits.length} active habits`);

      for (const habit of habits) {
        // Skip if habit doesn't have a reminder time
        if (!habit.reminderTime) {
          continue;
        }

        // Check if it's time for this habit's reminder
        // Always use UTC time to ensure consistency regardless of server location
        const nowUTC = new Date();
        const userTimezone = user.timezone || 'UTC';
        const zonedNow = utcToZonedTime(nowUTC, userTimezone);
        const currentTime = formatInTimeZone(nowUTC, userTimezone, 'HH:mm');

        console.log(`Habit "${habit.name}": reminderTime=${habit.reminderTime}, currentTime=${currentTime}`);

        if (habit.reminderTime !== currentTime) {
          continue;
        }

        console.log(`✅ TIME MATCH for habit "${habit.name}"!`);

        // Check if habit is already completed today
        const todayStart = startOfDay(zonedNow);
        const todayEnd = endOfDay(zonedNow);

        const completion = await Completion.findOne({
          habitId: habit._id,
          completedAt: {
            $gte: todayStart,
            $lte: todayEnd
          }
        });

        console.log(`Habit "${habit.name}": completed today? ${!!completion}`);

        // Only send reminder if habit is not completed
        if (!completion) {
          console.log(`📬 Creating notification for habit "${habit.name}"...`);
          await createNotification(
            user._id,
            'habit_reminder',
            '🎯 Time for your habit!',
            `Don't forget to complete "${habit.name}" today!`,
            { habitId: habit._id, habitName: habit.name }
          );
        }
      }
    }

    console.log('Habit reminders job completed');
  } catch (error) {
    console.error('Error in habit reminders job:', error);
  }
};

/**
 * 2. Streak Milestones
 * Check for streak milestones (7, 14, 30, 60, 90, 180, 365 days)
 */
export const checkStreakMilestones = async () => {
  console.log('Running streak milestones job...');

  try {
    const users = await User.find({ isActive: true, softDeleted: false });
    const milestones = [7, 14, 30, 60, 90, 180, 365];

    for (const user of users) {
      if (!hasNotificationEnabled(user, 'streakMilestones')) {
        continue;
      }

      if (isWithinQuietHours(user)) {
        continue;
      }

      const habits = await Habit.find({ userId: user._id, softDeleted: false });

      for (const habit of habits) {
        if (milestones.includes(habit.currentStreak)) {
          // Check if we already sent this milestone notification
          const existingNotification = await Notification.findOne({
            userId: user._id,
            type: 'streak_milestone',
            'metadata.habitId': habit._id,
            'metadata.milestone': habit.currentStreak,
            createdAt: { $gte: subDays(new Date(), 1) }
          });

          if (!existingNotification) {
            await createNotification(
              user._id,
              'streak_milestone',
              `🔥 ${habit.currentStreak}-Day Streak!`,
              `Amazing! You've maintained "${habit.name}" for ${habit.currentStreak} days straight!`,
              { habitId: habit._id, habitName: habit.name, milestone: habit.currentStreak }
            );
          }
        }
      }
    }

    console.log('Streak milestones job completed');
  } catch (error) {
    console.error('Error in streak milestones job:', error);
  }
};

/**
 * 3. Daily Summary
 * Send end-of-day summary at 9 PM
 */
export const sendDailySummary = async () => {
  console.log('Running daily summary job...');

  try {
    const users = await User.find({ isActive: true, softDeleted: false });

    for (const user of users) {
      if (!hasNotificationEnabled(user, 'dailySummary')) {
        continue;
      }

      if (isWithinQuietHours(user)) {
        continue;
      }

      const userTimezone = user.timezone || 'UTC';
      // Always use UTC time to ensure consistency regardless of server location
      const nowUTC = new Date();
      const zonedNow = utcToZonedTime(nowUTC, userTimezone);
      const todayStart = startOfDay(zonedNow);
      const todayEnd = endOfDay(zonedNow);

      // Get today's completions
      const habits = await Habit.find({ userId: user._id, softDeleted: false });
      
      // Only send if user has habits
      if (habits.length === 0) {
        continue;
      }

      const completions = await Completion.find({
        habitId: { $in: habits.map(h => h._id) },
        completedAt: { $gte: todayStart, $lte: todayEnd }
      });

      const completedCount = completions.length;
      const totalCount = habits.length;
      const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      let message = '';
      if (completedCount === 0) {
        message = `You didn't complete any habits today. Tomorrow is a new opportunity!`;
      } else if (completedCount === totalCount) {
        message = `Perfect day! You completed all ${totalCount} habits! 🎉`;
      } else {
        message = `You completed ${completedCount} out of ${totalCount} habits today (${completionRate}%). Keep it up!`;
      }

      await createNotification(
        user._id,
        'daily_summary',
        '📊 Your Daily Summary',
        message,
        { completedCount, totalCount, completionRate }
      );
    }

    console.log('Daily summary job completed');
  } catch (error) {
    console.error('Error in daily summary job:', error);
  }
};

/**
 * 4. Weekly Insights
 * Send weekly analytics every Monday at 9 AM
 */
export const sendWeeklyInsights = async () => {
  console.log('Running weekly insights job...');

  try {
    const users = await User.find({ isActive: true, softDeleted: false });

    for (const user of users) {
      if (!hasNotificationEnabled(user, 'weeklyInsights')) {
        continue;
      }

      if (isWithinQuietHours(user)) {
        continue;
      }

      const userTimezone = user.timezone || 'UTC';
      // Always use UTC time to ensure consistency regardless of server location
      const nowUTC = new Date();
      const zonedNow = utcToZonedTime(nowUTC, userTimezone);
      const weekStart = startOfWeek(zonedNow, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(zonedNow, { weekStartsOn: 1 });

      // Get this week's data
      const habits = await Habit.find({ userId: user._id, softDeleted: false });
      
      // Only send if user has habits
      if (habits.length === 0) {
        continue;
      }

      const completions = await Completion.find({
        habitId: { $in: habits.map(h => h._id) },
        completedAt: { $gte: weekStart, $lte: weekEnd }
      });

      const totalPossible = habits.length * 7;
      const completedCount = completions.length;
      const weeklyRate = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;

      // Find best performing habit
      const habitCompletions = {};
      completions.forEach(c => {
        const habitId = c.habitId.toString();
        habitCompletions[habitId] = (habitCompletions[habitId] || 0) + 1;
      });

      let bestHabit = null;
      let maxCompletions = 0;
      for (const [habitId, count] of Object.entries(habitCompletions)) {
        if (count > maxCompletions) {
          maxCompletions = count;
          bestHabit = habits.find(h => h._id.toString() === habitId);
        }
      }

      let message = `This week you completed ${completedCount} habits with a ${weeklyRate}% completion rate.`;
      if (bestHabit) {
        message += ` Your star habit was "${bestHabit.name}" with ${maxCompletions} completions!`;
      }

      await createNotification(
        user._id,
        'weekly_insights',
        '📈 Your Weekly Insights',
        message,
        { completedCount, totalPossible, weeklyRate, bestHabitName: bestHabit?.name }
      );
    }

    console.log('Weekly insights job completed');
  } catch (error) {
    console.error('Error in weekly insights job:', error);
  }
};

/**
 * 5. Challenge Updates
 * Send updates about active challenges (morning and evening)
 */
export const sendChallengeUpdates = async () => {
  console.log('Running challenge updates job...');

  try {
    const users = await User.find({ isActive: true, softDeleted: false });

    for (const user of users) {
      if (!hasNotificationEnabled(user, 'challengeUpdates')) {
        continue;
      }

      if (isWithinQuietHours(user)) {
        continue;
      }

      // Check for active personal challenges
      // Always use UTC time to ensure consistency regardless of server location
      const nowUTC = new Date();
      const activeChallenges = user.challengeParticipations?.filter(cp => {
        return !cp.completed && new Date(cp.startDate) <= nowUTC && new Date(cp.endDate) >= nowUTC;
      }) || [];

      // Check for community challenges
      const circles = await CommunityCircle.find({
        'members.userId': user._id,
        'challenges.endDate': { $gte: nowUTC }
      });

      let activeCommunityChallenges = 0;
      if (circles.length > 0) {
        circles.forEach(circle => {
          const active = circle.challenges?.filter(ch => {
            return new Date(ch.startDate) <= nowUTC && new Date(ch.endDate) >= nowUTC;
          }) || [];
          activeCommunityChallenges += active.length;
        });
      }

      // Only send notification if user has active challenges (personal or community)
      if (activeChallenges.length === 0 && activeCommunityChallenges === 0) {
        continue;
      }

      // Send notification about active challenges
      if (activeChallenges.length > 0 && activeCommunityChallenges > 0) {
        // User has both personal and community challenges
        const challenge = activeChallenges[0];
        const daysLeft = Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        await createNotification(
          user._id,
          'challenge_update',
          '🏆 Challenge Progress Update',
          `You have ${activeChallenges.length} personal and ${activeCommunityChallenges} community challenge(s) active. ${daysLeft} days left on your current challenge!`,
          { personalChallenges: activeChallenges.length, communityChallenges: activeCommunityChallenges, daysLeft }
        );
      } else if (activeChallenges.length > 0) {
        // Only personal challenges
        const challenge = activeChallenges[0];
        const daysLeft = Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24));

        await createNotification(
          user._id,
          'challenge_update',
          '🏆 Challenge Progress Update',
          `You have ${activeChallenges.length} active challenge(s). ${daysLeft} days left to complete your current challenge!`,
          { challengeCount: activeChallenges.length, daysLeft }
        );
      } else {
        // Only community challenges
        await createNotification(
          user._id,
          'challenge_update',
          '🏆 Community Challenge Update',
          `You have ${activeCommunityChallenges} active community challenge(s). Keep pushing!`,
          { communityChallengeCount: activeCommunityChallenges }
        );
      }
    }

    console.log('Challenge updates job completed');
  } catch (error) {
    console.error('Error in challenge updates job:', error);
  }
};

/**
 * 6. Community Activity
 * Send notifications about community activity (morning and evening)
 */
export const sendCommunityActivity = async () => {
  console.log('Running community activity job...');

  try {
    const users = await User.find({ isActive: true, softDeleted: false });

    for (const user of users) {
      if (!hasNotificationEnabled(user, 'communityActivity')) {
        continue;
      }

      if (isWithinQuietHours(user)) {
        continue;
      }

      // Get user's circles
      const circles = await CommunityCircle.find({
        'members.userId': user._id
      });

      if (circles.length === 0) {
        continue;
      }

      // Count recent activity (last 24 hours)
      const yesterday = subDays(new Date(), 1);
      let newMessages = 0;
      let newAnnouncements = 0;
      let newMembers = 0;

      circles.forEach(circle => {
        // Count new messages
        const recentMessages = circle.messages?.filter(m => new Date(m.createdAt) >= yesterday) || [];
        newMessages += recentMessages.length;

        // Count new announcements
        const recentAnnouncements = circle.announcements?.filter(a => new Date(a.createdAt) >= yesterday) || [];
        newAnnouncements += recentAnnouncements.length;

        // Count new members
        const recentMembers = circle.members?.filter(m => new Date(m.joinedAt) >= yesterday) || [];
        newMembers += recentMembers.length;
      });

      const totalActivity = newMessages + newAnnouncements + newMembers;

      if (totalActivity > 0) {
        let message = `Your community has been active! `;
        const activities = [];
        if (newMessages > 0) activities.push(`${newMessages} new message(s)`);
        if (newAnnouncements > 0) activities.push(`${newAnnouncements} new announcement(s)`);
        if (newMembers > 0) activities.push(`${newMembers} new member(s)`);
        message += activities.join(', ');

        await createNotification(
          user._id,
          'community_activity',
          '👥 Community Activity',
          message,
          { newMessages, newAnnouncements, newMembers, circleCount: circles.length }
        );
      }
    }

    console.log('Community activity job completed');
  } catch (error) {
    console.error('Error in community activity job:', error);
  }
};

/**
 * 7. System Updates
 * Send important system updates (triggered manually or on schedule)
 */
export const sendSystemUpdate = async (title, message, metadata = {}) => {
  console.log('Sending system update to all users...');

  try {
    const users = await User.find({ isActive: true, softDeleted: false });

    for (const user of users) {
      if (!hasNotificationEnabled(user, 'systemUpdates')) {
        continue;
      }

      await createNotification(
        user._id,
        'system_update',
        `⚙️ ${title}`,
        message,
        metadata
      );
    }

    console.log('System update sent to all users');
  } catch (error) {
    console.error('Error sending system update:', error);
  }
};

/**
 * 8. Tips & Tricks
 * Send helpful tips (morning and evening)
 */
const tips = [
  "Start small! Building a habit is easier when you begin with just 2 minutes a day.",
  "Stack your habits! Link a new habit to an existing one for better consistency.",
  "Track your progress visually. Seeing your streak grow is incredibly motivating!",
  "Don't break the chain! Even on tough days, do the minimum to keep your streak alive.",
  "Celebrate small wins! Every completed habit is a step toward your goals.",
  "Use the 2-minute rule: If a habit takes less than 2 minutes, do it now!",
  "Environment matters! Make good habits obvious and bad habits invisible.",
  "Focus on systems, not goals. Good systems lead to great results.",
  "Be patient with yourself. It takes time to build lasting habits.",
  "Join a community! Accountability and support make habit-building easier."
];

export const sendTipsAndTricks = async () => {
  console.log('Running tips and tricks job...');

  try {
    const users = await User.find({ isActive: true, softDeleted: false });
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    for (const user of users) {
      if (!hasNotificationEnabled(user, 'tipsAndTricks')) {
        continue;
      }

      if (isWithinQuietHours(user)) {
        continue;
      }

      // Only send tips to users who have habits (tips are about habit-building)
      const habits = await Habit.find({ userId: user._id, softDeleted: false });
      if (habits.length === 0) {
        continue;
      }

      await createNotification(
        user._id,
        'tips_tricks',
        '💡 Tip of the Day',
        randomTip,
        {}
      );
    }

    console.log('Tips and tricks job completed');
  } catch (error) {
    console.error('Error in tips and tricks job:', error);
  }
};

/**
 * Initialize all cron jobs
 */
export const initializeNotificationScheduler = () => {
  console.log('Initializing notification scheduler...');

  // Habit reminders - Run every minute to check for scheduled reminders
  cron.schedule('* * * * *', sendHabitReminders);

  // Streak milestones - Run every hour
  cron.schedule('0 * * * *', checkStreakMilestones);

  // Daily summary - Run at 9 PM every day
  cron.schedule('0 21 * * *', sendDailySummary);

  // Weekly insights - Run every Monday at 9 AM
  cron.schedule('0 9 * * 1', sendWeeklyInsights);

  // Challenge updates - Run at 9 AM and 9 PM
  cron.schedule('0 9,21 * * *', sendChallengeUpdates);

  // Community activity - Run at 9 AM and 9 PM
  cron.schedule('0 9,21 * * *', sendCommunityActivity);

  // Tips & Tricks - Run at 9 AM and 9 PM
  cron.schedule('0 9,21 * * *', sendTipsAndTricks);

  // Auto-use forgiveness tokens - Run at 11:50 PM every day
  cron.schedule('50 23 * * *', async () => {
    try {
      console.log('Running automatic forgiveness token job...');
      await autoUseForgivenessTokens();
    } catch (error) {
      console.error('Error in automatic forgiveness token job:', error);
    }
  });

  console.log('Notification scheduler initialized successfully (including auto-forgiveness at 11:50 PM)');
};

export default {
  initializeNotificationScheduler,
  sendHabitReminders,
  checkStreakMilestones,
  sendDailySummary,
  sendWeeklyInsights,
  sendChallengeUpdates,
  sendCommunityActivity,
  sendSystemUpdate,
  sendTipsAndTricks
};
