/**
 * Utility functions for filtering habits based on frequency and date
 */

/**
 * Get habits that should be displayed/counted for a specific date
 * @param {Array} habits - Array of habit objects
 * @param {Date} date - The date to check
 * @returns {Array} - Filtered array of habits relevant for the date
 */
export const getDisplayableHabitsForDate = (habits, date) => {
  const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
  
  return habits.filter(habit => {
    if (!habit.active) return false;
    
    // Always show daily and weekly habits
    if (habit.frequency === 'daily' || habit.frequency === 'weekly') {
      return true;
    }
    
    // For custom habits, only show if the date is a selected day
    if (habit.frequency === 'custom') {
      const selectedDays = habit.customFrequency?.daysOfWeek || [];
      return selectedDays.includes(dayOfWeek);
    }
    
    return true; // Default: show the habit
  });
};

/**
 * Check if a habit should be visible on a specific date
 * @param {Object} habit - The habit object
 * @param {Date} date - The date to check
 * @returns {Boolean} - True if habit should be visible
 */
export const isHabitVisibleOnDate = (habit, date) => {
  if (habit.frequency !== 'custom') return true;
  
  const dayOfWeek = date.getDay();
  const selectedDays = habit.customFrequency?.daysOfWeek || [];
  return selectedDays.includes(dayOfWeek);
};

/**
 * Calculate perfect days for a user within a date range
 * @param {String} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date (optional, defaults to today)
 * @param {Object} session - Mongoose session for transactions
 * @returns {Number} - Count of perfect days
 */
export const calculatePerfectDays = async (userId, startDate, endDate = new Date(), session = null) => {
  const mongoose = await import('mongoose');
  const Habit = mongoose.default.model('Habit');
  const Completion = mongoose.default.model('Completion');
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  let perfectDaysCount = 0;
  const currentDate = new Date(start);
  
  // Check each day
  while (currentDate <= end) {
    // Get habits that were relevant for this date
    const query = Habit.find({ userId, active: true });
    if (session) query.session(session);
    const allUserHabits = await query;
    
    const relevantHabits = getDisplayableHabitsForDate(allUserHabits, currentDate);
    
    if (relevantHabits.length > 0) {
      // Get completions for this date
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const completionsQuery = Completion.find({
        userId,
        completedAt: { $gte: dayStart, $lte: dayEnd }
      });
      if (session) completionsQuery.session(session);
      const completionsForDay = await completionsQuery;
      
      const completedHabitIds = completionsForDay.map(c => c.habitId.toString());
      const relevantHabitIds = relevantHabits.map(h => h._id.toString());
      
      // Check if ALL relevant habits were completed
      const allCompleted = relevantHabitIds.every(id => completedHabitIds.includes(id));
      
      if (allCompleted) {
        perfectDaysCount++;
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return perfectDaysCount;
};
