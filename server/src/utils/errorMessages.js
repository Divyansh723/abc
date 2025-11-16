/**
 * Error messages for habit completion validation
 */
export const COMPLETION_ERROR_MESSAGES = {
  // Daily habit errors
  DAILY_ALREADY_COMPLETED: "You've already completed this habit today. Come back tomorrow!",
  
  // Weekly habit errors
  WEEKLY_ALREADY_COMPLETED: "You've completed this habit this week. It will be available again next Sunday.",
  
  // Custom habit errors
  CUSTOM_WRONG_DAY: (selectedDays) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayNames = selectedDays.map(d => dayNames[d]).join(', ');
    return `This habit is only available on: ${selectedDayNames}`;
  },
  CUSTOM_ALREADY_COMPLETED: "You've already completed this habit today.",
  
  // General errors
  INVALID_HABIT: 'Invalid habit or user',
  INVALID_FREQUENCY: 'Invalid habit frequency',
  HABIT_NOT_FOUND: 'Habit not found',
  
  // Validation errors
  CUSTOM_NO_DAYS_SELECTED: 'Custom frequency habits must have at least one day selected',
  INVALID_DAY_VALUE: 'Day values must be between 0 (Sunday) and 6 (Saturday)'
};

/**
 * Success messages for habit completion
 */
export const COMPLETION_SUCCESS_MESSAGES = {
  HABIT_COMPLETED: 'Habit completed successfully!',
  HABIT_UNCOMPLETED: 'Habit completion removed successfully!'
};

/**
 * UI status messages for different completion states
 */
export const UI_STATUS_MESSAGES = {
  // Completed states
  COMPLETED_TODAY: 'Completed today',
  COMPLETED_THIS_WEEK: 'Completed this week',
  
  // Unavailable states
  NOT_AVAILABLE_TODAY: 'Not available today',
  WRONG_DAY_FOR_CUSTOM: (selectedDays) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayNames = selectedDays.map(d => dayNames[d]).join(', ');
    return `Available on: ${selectedDayNames}`;
  },
  
  // Button states
  COMPLETING: 'Completing...',
  UPDATING: 'Updating...',
  COMPLETE: 'Complete',
  COMPLETED: 'Completed',
  NOT_TODAY: 'Not Today'
};

/**
 * Helper function to get appropriate error message
 */
export const getCompletionErrorMessage = (frequency, reason, selectedDays = []) => {
  switch (frequency) {
    case 'daily':
      return COMPLETION_ERROR_MESSAGES.DAILY_ALREADY_COMPLETED;
    
    case 'weekly':
      return COMPLETION_ERROR_MESSAGES.WEEKLY_ALREADY_COMPLETED;
    
    case 'custom':
      if (reason === 'wrong_day') {
        return COMPLETION_ERROR_MESSAGES.CUSTOM_WRONG_DAY(selectedDays);
      }
      return COMPLETION_ERROR_MESSAGES.CUSTOM_ALREADY_COMPLETED;
    
    default:
      return COMPLETION_ERROR_MESSAGES.INVALID_FREQUENCY;
  }
};

/**
 * Helper function to get appropriate UI status message
 */
export const getUIStatusMessage = (frequency, isCompleted, selectedDays = []) => {
  if (isCompleted) {
    if (frequency === 'weekly') {
      return UI_STATUS_MESSAGES.COMPLETED_THIS_WEEK;
    }
    return UI_STATUS_MESSAGES.COMPLETED_TODAY;
  }
  
  if (frequency === 'custom' && selectedDays.length > 0) {
    return UI_STATUS_MESSAGES.WRONG_DAY_FOR_CUSTOM(selectedDays);
  }
  
  return UI_STATUS_MESSAGES.NOT_AVAILABLE_TODAY;
};
