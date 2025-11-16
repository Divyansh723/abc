import mongoose from 'mongoose';

/**
 * Get the start of day in user's timezone
 * @param {Date} date - The date to get start of day for
 * @param {string} timezone - User's timezone (e.g., 'America/New_York')
 * @returns {Date} Start of day in UTC
 */
export const getStartOfDay = (date, timezone = 'UTC') => {
  const dateStr = date.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(dateStr);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
};

/**
 * Get the end of day in user's timezone
 * @param {Date} date - The date to get end of day for
 * @param {string} timezone - User's timezone
 * @returns {Date} End of day in UTC
 */
export const getEndOfDay = (date, timezone = 'UTC') => {
  const dateStr = date.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(dateStr);
  localDate.setHours(23, 59, 59, 999);
  return localDate;
};

/**
 * Get the start of week (Sunday) in user's timezone
 * @param {Date} date - The date to get start of week for
 * @param {string} timezone - User's timezone
 * @returns {Date} Start of week (Sunday) in UTC
 */
export const getStartOfWeek = (date, timezone = 'UTC') => {
  const dateStr = date.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(dateStr);
  const day = localDate.getDay();
  const diff = localDate.getDate() - day; // Subtract days to get to Sunday
  localDate.setDate(diff);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
};

/**
 * Get the end of week (Saturday) in user's timezone
 * @param {Date} date - The date to get end of week for
 * @param {string} timezone - User's timezone
 * @returns {Date} End of week (Saturday) in UTC
 */
export const getEndOfWeek = (date, timezone = 'UTC') => {
  const dateStr = date.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(dateStr);
  const day = localDate.getDay();
  const diff = localDate.getDate() + (6 - day); // Add days to get to Saturday
  localDate.setDate(diff);
  localDate.setHours(23, 59, 59, 999);
  return localDate;
};

/**
 * Check if a daily habit can be completed today
 * @param {string} habitId - The habit ID
 * @param {string} userId - The user ID
 * @param {Date} date - The date to check (defaults to now)
 * @param {string} timezone - User's timezone
 * @returns {Promise<{canComplete: boolean, reason?: string}>}
 */
export const canCompleteToday = async (habitId, userId, date = new Date(), timezone = 'UTC') => {
  const Completion = mongoose.model('Completion');
  
  const startOfDay = getStartOfDay(date, timezone);
  const endOfDay = getEndOfDay(date, timezone);
  
  const existingCompletion = await Completion.findOne({
    habitId,
    userId,
    completedAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
  
  if (existingCompletion) {
    return {
      canComplete: false,
      reason: "You've already completed this habit today. Come back tomorrow!"
    };
  }
  
  return { canComplete: true };
};

/**
 * Check if a weekly habit can be completed this week
 * @param {string} habitId - The habit ID
 * @param {string} userId - The user ID
 * @param {Date} date - The date to check (defaults to now)
 * @param {string} timezone - User's timezone
 * @returns {Promise<{canComplete: boolean, reason?: string}>}
 */
export const canCompleteThisWeek = async (habitId, userId, date = new Date(), timezone = 'UTC') => {
  const Completion = mongoose.model('Completion');
  
  const startOfWeek = getStartOfWeek(date, timezone);
  const endOfWeek = getEndOfWeek(date, timezone);
  
  const existingCompletion = await Completion.findOne({
    habitId,
    userId,
    completedAt: {
      $gte: startOfWeek,
      $lte: endOfWeek
    }
  });
  
  if (existingCompletion) {
    return {
      canComplete: false,
      reason: "You've completed this habit this week. It will be available again next Sunday."
    };
  }
  
  return { canComplete: true };
};

/**
 * Check if today is a selected day for a custom habit
 * @param {Array<number>} daysOfWeek - Array of selected days (0=Sunday, 6=Saturday)
 * @param {Date} date - The date to check (defaults to now)
 * @param {string} timezone - User's timezone
 * @returns {boolean}
 */
export const isSelectedDay = (daysOfWeek, date = new Date(), timezone = 'UTC') => {
  if (!daysOfWeek || daysOfWeek.length === 0) {
    return false;
  }
  
  const dateStr = date.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(dateStr);
  const dayOfWeek = localDate.getDay(); // 0-6
  
  return daysOfWeek.includes(dayOfWeek);
};

/**
 * Check if a custom habit can be completed today
 * @param {Object} habit - The habit object with customFrequency
 * @param {string} userId - The user ID
 * @param {Date} date - The date to check (defaults to now)
 * @param {string} timezone - User's timezone
 * @returns {Promise<{canComplete: boolean, reason?: string}>}
 */
export const canCompleteCustom = async (habit, userId, date = new Date(), timezone = 'UTC') => {
  const Completion = mongoose.model('Completion');
  
  // Check if today is a selected day
  const daysOfWeek = habit.customFrequency?.daysOfWeek || [];
  if (!isSelectedDay(daysOfWeek, date, timezone)) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayNames = daysOfWeek.map(d => dayNames[d]).join(', ');
    return {
      canComplete: false,
      reason: `This habit is only available on: ${selectedDayNames}`
    };
  }
  
  // Check if already completed today
  const startOfDay = getStartOfDay(date, timezone);
  const endOfDay = getEndOfDay(date, timezone);
  
  const existingCompletion = await Completion.findOne({
    habitId: habit._id,
    userId,
    completedAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
  
  if (existingCompletion) {
    return {
      canComplete: false,
      reason: "You've already completed this habit today."
    };
  }
  
  return { canComplete: true };
};

/**
 * Main validation function that routes to the appropriate check based on frequency
 * @param {Object} habit - The habit object
 * @param {string} userId - The user ID
 * @param {Date} date - The date to check (defaults to now)
 * @param {string} timezone - User's timezone
 * @returns {Promise<{canComplete: boolean, reason?: string}>}
 */
export const canCompleteHabit = async (habit, userId, date = new Date(), timezone = 'UTC') => {
  if (!habit || !userId) {
    return {
      canComplete: false,
      reason: 'Invalid habit or user'
    };
  }
  
  switch (habit.frequency) {
    case 'daily':
      return canCompleteToday(habit._id, userId, date, timezone);
    
    case 'weekly':
      return canCompleteThisWeek(habit._id, userId, date, timezone);
    
    case 'custom':
      return canCompleteCustom(habit, userId, date, timezone);
    
    default:
      return {
        canComplete: false,
        reason: 'Invalid habit frequency'
      };
  }
};
