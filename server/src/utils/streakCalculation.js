import { getStartOfDay, getStartOfWeek, getEndOfWeek } from './completionValidation.js';

/**
 * Calculate streak for daily habits
 * Counts consecutive days with completions
 */
export const calculateDailyStreak = (completions, timezone = 'UTC') => {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique completion dates
  const uniqueDates = [];
  const seenDates = new Set();
  
  for (const completion of completions) {
    const dateStr = completion.completedAt.toISOString().split('T')[0];
    if (!seenDates.has(dateStr)) {
      seenDates.add(dateStr);
      uniqueDates.push(new Date(completion.completedAt));
    }
  }

  // Sort dates descending
  uniqueDates.sort((a, b) => b - a);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let expectedDate = new Date();
  expectedDate.setHours(0, 0, 0, 0);

  // Check if the most recent completion is today or yesterday
  const mostRecentDate = new Date(uniqueDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((expectedDate - mostRecentDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 1) {
    // Streak is broken if more than 1 day gap
    return { currentStreak: 0, longestStreak: calculateLongestDailyStreak(uniqueDates) };
  }

  // Start from today or yesterday
  if (daysDiff === 1) {
    expectedDate.setDate(expectedDate.getDate() - 1);
  }

  // Count consecutive days for current streak
  for (const completionDate of uniqueDates) {
    const compDate = new Date(completionDate);
    compDate.setHours(0, 0, 0, 0);
    
    if (compDate.getTime() === expectedDate.getTime()) {
      currentStreak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  longestStreak = Math.max(currentStreak, calculateLongestDailyStreak(uniqueDates));

  return { currentStreak, longestStreak };
};

/**
 * Helper to calculate longest daily streak from all completions
 */
const calculateLongestDailyStreak = (sortedDates) => {
  let longest = 0;
  let current = 1;
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const date1 = new Date(sortedDates[i]);
    const date2 = new Date(sortedDates[i + 1]);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }
  
  return Math.max(longest, current);
};

/**
 * Calculate streak for weekly habits
 * Counts consecutive weeks with at least one completion
 */
export const calculateWeeklyStreak = (completions, timezone = 'UTC') => {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique weeks with completions
  const uniqueWeeks = new Set();
  
  for (const completion of completions) {
    const weekStart = getStartOfWeek(completion.completedAt, timezone);
    const weekKey = weekStart.toISOString().split('T')[0];
    uniqueWeeks.add(weekKey);
  }

  // Convert to array and sort descending
  const weekArray = Array.from(uniqueWeeks).sort((a, b) => new Date(b) - new Date(a));

  if (weekArray.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  
  // Check if most recent week is current week or last week
  const now = new Date();
  const currentWeekStart = getStartOfWeek(now, timezone);
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  const mostRecentWeek = new Date(weekArray[0]);
  
  // If most recent completion is not in current or last week, streak is broken
  if (mostRecentWeek < lastWeekStart) {
    return { currentStreak: 0, longestStreak: calculateLongestWeeklyStreak(weekArray) };
  }

  // Start counting from most recent week
  let expectedWeek = new Date(weekArray[0]);
  
  for (const weekStr of weekArray) {
    const weekDate = new Date(weekStr);
    
    if (weekDate.getTime() === expectedWeek.getTime()) {
      currentStreak++;
      expectedWeek.setDate(expectedWeek.getDate() - 7);
    } else {
      break;
    }
  }

  longestStreak = Math.max(currentStreak, calculateLongestWeeklyStreak(weekArray));

  return { currentStreak, longestStreak };
};

/**
 * Helper to calculate longest weekly streak
 */
const calculateLongestWeeklyStreak = (sortedWeeks) => {
  let longest = 0;
  let current = 1;
  
  for (let i = 0; i < sortedWeeks.length - 1; i++) {
    const week1 = new Date(sortedWeeks[i]);
    const week2 = new Date(sortedWeeks[i + 1]);
    
    const weeksDiff = Math.floor((week1 - week2) / (1000 * 60 * 60 * 24 * 7));
    
    if (weeksDiff === 1) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }
  
  return Math.max(longest, current);
};

/**
 * Calculate streak for custom habits (specific days of week)
 * Counts consecutive occurrences of selected days with completions
 */
export const calculateCustomStreak = (completions, selectedDays = [], timezone = 'UTC') => {
  if (completions.length === 0 || selectedDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique completion dates
  const uniqueDates = [];
  const seenDates = new Set();
  
  for (const completion of completions) {
    const dateStr = completion.completedAt.toISOString().split('T')[0];
    if (!seenDates.has(dateStr)) {
      seenDates.add(dateStr);
      uniqueDates.push(new Date(completion.completedAt));
    }
  }

  // Sort dates descending
  uniqueDates.sort((a, b) => b - a);

  // Generate expected dates based on selected days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find the most recent expected day (today or before)
  let expectedDate = new Date(today);
  while (!selectedDays.includes(expectedDate.getDay())) {
    expectedDate.setDate(expectedDate.getDate() - 1);
  }

  let currentStreak = 0;
  let completionIndex = 0;

  // Count current streak
  while (completionIndex < uniqueDates.length) {
    const compDate = new Date(uniqueDates[completionIndex]);
    compDate.setHours(0, 0, 0, 0);
    
    if (compDate.getTime() === expectedDate.getTime()) {
      currentStreak++;
      completionIndex++;
      
      // Move to previous expected day
      do {
        expectedDate.setDate(expectedDate.getDate() - 1);
      } while (!selectedDays.includes(expectedDate.getDay()));
    } else if (compDate < expectedDate) {
      // Missed an expected day, streak is broken
      break;
    } else {
      // Completion is in the future (shouldn't happen), skip it
      completionIndex++;
    }
  }

  // Calculate longest streak
  const longestStreak = calculateLongestCustomStreak(uniqueDates, selectedDays);

  return { currentStreak, longestStreak };
};

/**
 * Helper to calculate longest custom streak
 */
const calculateLongestCustomStreak = (sortedDates, selectedDays) => {
  if (sortedDates.length === 0) return 0;

  let longest = 0;
  let current = 1;
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const date1 = new Date(sortedDates[i]);
    const date2 = new Date(sortedDates[i + 1]);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    
    // Find the next expected day after date2
    let expectedDate = new Date(date1);
    do {
      expectedDate.setDate(expectedDate.getDate() - 1);
    } while (!selectedDays.includes(expectedDate.getDay()));
    
    if (date2.getTime() === expectedDate.getTime()) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }
  
  return Math.max(longest, current);
};

/**
 * Main function to calculate streak based on habit frequency
 */
export const calculateHabitStreak = (habit, completions, timezone = 'UTC') => {
  switch (habit.frequency) {
    case 'daily':
      return calculateDailyStreak(completions, timezone);
    
    case 'weekly':
      return calculateWeeklyStreak(completions, timezone);
    
    case 'custom':
      const selectedDays = habit.customFrequency?.daysOfWeek || [];
      return calculateCustomStreak(completions, selectedDays, timezone);
    
    default:
      // Default to daily calculation
      return calculateDailyStreak(completions, timezone);
  }
};

/**
 * Calculate consistency rate based on habit frequency
 * Returns percentage of expected completions that were actually completed
 */
export const calculateConsistencyRate = (habit, completions, daysToCheck = 30, timezone = 'UTC') => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysToCheck);
  startDate.setHours(0, 0, 0, 0);

  // Filter completions within the time period
  const recentCompletions = completions.filter(c => {
    const compDate = new Date(c.completedAt);
    return compDate >= startDate && compDate <= now;
  });

  let expectedCompletions = 0;
  let actualCompletions = recentCompletions.length;

  switch (habit.frequency) {
    case 'daily':
      // Expected: one completion per day
      expectedCompletions = daysToCheck;
      break;

    case 'weekly':
      // Expected: one completion per week
      const weeksInPeriod = Math.ceil(daysToCheck / 7);
      expectedCompletions = weeksInPeriod;
      break;

    case 'custom':
      // Expected: one completion per selected day
      const selectedDays = habit.customFrequency?.daysOfWeek || [];
      if (selectedDays.length === 0) {
        return 0;
      }

      // Count how many selected days occurred in the period
      let currentDate = new Date(startDate);
      while (currentDate <= now) {
        if (selectedDays.includes(currentDate.getDay())) {
          expectedCompletions++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      break;

    default:
      expectedCompletions = daysToCheck;
  }

  if (expectedCompletions === 0) {
    return 0;
  }

  return Math.min(100, Math.round((actualCompletions / expectedCompletions) * 100));
};
