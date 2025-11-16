import { startOfDay, differenceInDays, subDays, format } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { type Completion } from '@/types/habit';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakStartDate?: Date;
  streakEndDate?: Date;
  canUseForgiveness: boolean;
  daysSinceLastCompletion: number;
}

export interface ForgivenessTokenUsage {
  canUse: boolean;
  reason?: string;
  daysToRecover: number;
}

/**
 * Calculate streak data based on completion history (alias for calculateStreak)
 */
export const calculateStreakData = (
  completions: Completion[],
  timezone: string = 'UTC'
): StreakData => {
  return calculateStreak(completions, timezone);
};

/**
 * Calculate streak data based on completion history
 */
export const calculateStreak = (
  completions: Completion[],
  timezone: string = 'UTC'
): StreakData => {
  if (completions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      canUseForgiveness: false,
      daysSinceLastCompletion: 0,
    };
  }

  // Sort completions by date (most recent first)
  const sortedCompletions = completions
    .map(completion => ({
      ...completion,
      localDate: startOfDay(utcToZonedTime(completion.completedAt, timezone))
    }))
    .sort((a, b) => b.localDate.getTime() - a.localDate.getTime());

  const today = startOfDay(utcToZonedTime(new Date(), timezone));
  // const yesterday = subDays(today, 1);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let streakStartDate: Date | undefined;
  let streakEndDate: Date | undefined;

  // Calculate current streak
  let expectedDate = today;
  let streakActive = true;

  for (const completion of sortedCompletions) {
    const completionDate = completion.localDate;
    const daysDiff = differenceInDays(expectedDate, completionDate);

    if (daysDiff === 0) {
      // Completion on expected date
      if (streakActive) {
        currentStreak++;
        if (currentStreak === 1) {
          streakEndDate = completionDate;
        }
        streakStartDate = completionDate;
      }
      tempStreak++;
      expectedDate = subDays(expectedDate, 1);
    } else if (daysDiff === 1) {
      // One day gap - streak continues but we need to check forgiveness
      if (streakActive) {
        // For current streak, a gap breaks it unless forgiveness is used
        streakActive = false;
      }
      tempStreak++;
      expectedDate = subDays(completionDate, 1);
    } else if (daysDiff > 1) {
      // Multiple day gap - streak is broken
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      tempStreak = 1;
      streakActive = false;
      expectedDate = subDays(completionDate, 1);
    } else {
      // Same day multiple completions or future date (shouldn't happen)
      continue;
    }
  }

  // Update longest streak if current temp streak is longer
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  // Calculate days since last completion
  const lastCompletion = sortedCompletions[0];
  const daysSinceLastCompletion = differenceInDays(today, lastCompletion.localDate);

  // Determine if forgiveness token can be used
  const canUseForgiveness = daysSinceLastCompletion <= 2 && daysSinceLastCompletion > 0;

  return {
    currentStreak,
    longestStreak,
    streakStartDate,
    streakEndDate,
    canUseForgiveness,
    daysSinceLastCompletion,
  };
};

/**
 * Check if a forgiveness token can be used for a specific date
 */
export const canUseForgivenessToken = (
  completions: Completion[],
  targetDate: Date,
  timezone: string = 'UTC'
): ForgivenessTokenUsage => {
  const today = startOfDay(utcToZonedTime(new Date(), timezone));
  const target = startOfDay(utcToZonedTime(targetDate, timezone));
  
  const daysDiff = differenceInDays(today, target);
  
  // Can only use forgiveness for yesterday or day before yesterday
  if (daysDiff < 1 || daysDiff > 2) {
    return {
      canUse: false,
      reason: daysDiff < 1 ? 'Cannot use forgiveness for future dates' : 'Can only use forgiveness within 2 days',
      daysToRecover: 0,
    };
  }

  // Check if already completed on that date
  const completionExists = completions.some(completion => {
    const completionDate = startOfDay(utcToZonedTime(completion.completedAt, timezone));
    return completionDate.getTime() === target.getTime();
  });

  if (completionExists) {
    return {
      canUse: false,
      reason: 'Habit already completed on this date',
      daysToRecover: 0,
    };
  }

  return {
    canUse: true,
    daysToRecover: daysDiff,
  };
};

/**
 * Apply forgiveness token to maintain streak
 */
export const applyForgivenessToken = (
  _completions: Completion[],
  forgivenessDate: Date,
  habitId: string,
  userId: string,
  timezone: string = 'UTC'
): Completion => {
  const forgivenessCompletion: Completion = {
    id: `forgiveness-${Date.now()}`,
    habitId,
    userId,
    completedAt: zonedTimeToUtc(startOfDay(forgivenessDate), timezone),
    deviceTimezone: timezone,
    xpEarned: 0, // No XP for forgiveness
    notes: 'Applied forgiveness token',
    editedFlag: true,
    createdAt: new Date(),
  };

  return forgivenessCompletion;
};

/**
 * Calculate consistency rate over a period
 */
export const calculateConsistencyRate = (
  completions: Completion[],
  days: number = 30,
  timezone: string = 'UTC'
): number => {
  if (days <= 0) return 0;

  const today = startOfDay(utcToZonedTime(new Date(), timezone));
  const startDate = subDays(today, days - 1);

  const completionDates = new Set(
    completions
      .filter(completion => {
        const completionDate = startOfDay(utcToZonedTime(completion.completedAt, timezone));
        return completionDate >= startDate && completionDate <= today;
      })
      .map(completion => 
        format(startOfDay(utcToZonedTime(completion.completedAt, timezone)), 'yyyy-MM-dd')
      )
  );

  return Math.round((completionDates.size / days) * 100);
};

/**
 * Get streak milestones and achievements
 */
export const getStreakMilestones = (currentStreak: number, longestStreak: number) => {
  const milestones = [7, 14, 21, 30, 50, 75, 100, 200, 365];
  
  const currentMilestones = milestones.filter(m => currentStreak >= m);
  const nextMilestone = milestones.find(m => m > currentStreak);
  const longestMilestones = milestones.filter(m => longestStreak >= m);

  return {
    currentMilestones,
    nextMilestone,
    longestMilestones,
    daysToNextMilestone: nextMilestone ? nextMilestone - currentStreak : null,
  };
};

/**
 * Generate recovery mini-challenge suggestions
 */
export const generateRecoveryChallenge = (
  habitName: string,
  daysMissed: number
): { title: string; description: string; duration: number; reward: string } => {
  const challenges = [
    {
      title: `${habitName} Recovery Sprint`,
      description: `Complete ${habitName} for 3 consecutive days to get back on track`,
      duration: 3,
      reward: '15 bonus XP + streak restoration',
    },
    {
      title: `Double Down Challenge`,
      description: `Do ${habitName} twice today to make up for lost momentum`,
      duration: 1,
      reward: '20 bonus XP',
    },
    {
      title: `Consistency Comeback`,
      description: `Complete ${habitName} for 5 out of the next 7 days`,
      duration: 7,
      reward: '25 bonus XP + forgiveness token',
    },
  ];

  // Choose challenge based on days missed
  if (daysMissed <= 2) {
    return challenges[0]; // 3-day sprint
  } else if (daysMissed <= 5) {
    return challenges[2]; // 7-day flexible challenge
  } else {
    return challenges[1]; // Single day intensive
  }
};

/**
 * Format streak display text
 */
export const formatStreakText = (streak: number): string => {
  if (streak === 0) return 'No streak';
  if (streak === 1) return '1 day streak';
  return `${streak} day streak`;
};

/**
 * Get streak emoji based on length
 */
export const getStreakEmoji = (streak: number): string => {
  if (streak === 0) return '⭕';
  if (streak < 7) return '🔥';
  if (streak < 14) return '🚀';
  if (streak < 30) return '⭐';
  if (streak < 100) return '💎';
  return '👑';
};