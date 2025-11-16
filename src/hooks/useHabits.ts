import { useState, useEffect, useCallback } from 'react';
import { habitService } from '@/services/habitService';
import { analyticsService } from '@/services/analyticsService';
import { type Habit } from '@/types/habit';
import { type HabitFormData } from '@/utils/validationUtils';
import { useGamificationStore } from '@/stores/gamificationStore';
import { eventBus, EVENTS } from '@/utils/eventBus';

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addHabitCompletionXP, fetchGamificationData } = useGamificationStore();

  // Fetch all habits
  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [habitsData, completionsData] = await Promise.all([
        habitService.getUserHabits(),
        habitService.getTodayCompletions(),
      ]);
      setHabits(habitsData);
      setTodayCompletions(completionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for events from other components and auto-refresh
  useEffect(() => {
    const handleHabitEvent = () => {
      fetchHabits();
    };

    const handleXPEvent = () => {
      fetchGamificationData();
    };

    // Subscribe to events
    eventBus.on(EVENTS.HABIT_COMPLETED, handleHabitEvent);
    eventBus.on(EVENTS.HABIT_CREATED, handleHabitEvent);
    eventBus.on(EVENTS.HABIT_UPDATED, handleHabitEvent);
    eventBus.on(EVENTS.HABIT_DELETED, handleHabitEvent);
    eventBus.on(EVENTS.FORGIVENESS_USED, handleHabitEvent);
    eventBus.on(EVENTS.XP_GAINED, handleXPEvent);
    eventBus.on(EVENTS.LEVEL_UP, handleXPEvent);

    // Cleanup
    return () => {
      eventBus.off(EVENTS.HABIT_COMPLETED, handleHabitEvent);
      eventBus.off(EVENTS.HABIT_CREATED, handleHabitEvent);
      eventBus.off(EVENTS.HABIT_UPDATED, handleHabitEvent);
      eventBus.off(EVENTS.HABIT_DELETED, handleHabitEvent);
      eventBus.off(EVENTS.FORGIVENESS_USED, handleHabitEvent);
      eventBus.off(EVENTS.XP_GAINED, handleXPEvent);
      eventBus.off(EVENTS.LEVEL_UP, handleXPEvent);
    };
  }, [fetchHabits, fetchGamificationData]);

  // Create a new habit
  const createHabit = useCallback(async (habitData: HabitFormData) => {
    try {
      console.log('useHabits: Creating habit with data:', habitData);
      const newHabit = await habitService.createHabit(habitData);
      console.log('useHabits: Habit created successfully:', newHabit);
      setHabits(prev => [...prev, newHabit]);
      
      // Emit event to notify other components
      eventBus.emit(EVENTS.HABIT_CREATED, newHabit);
      
      return newHabit;
    } catch (err) {
      console.error('useHabits: Error creating habit:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update an existing habit
  const updateHabit = useCallback(async (habitId: string, updates: Partial<HabitFormData>) => {
    try {
      const updatedHabit = await habitService.updateHabit(habitId, updates);
      setHabits(prev => prev.map(habit => 
        habit.id === habitId ? updatedHabit : habit
      ));
      
      // Emit event to notify other components
      eventBus.emit(EVENTS.HABIT_UPDATED, updatedHabit);
      
      return updatedHabit;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete a habit
  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      await habitService.deleteHabit(habitId);
      setHabits(prev => prev.filter(habit => habit.id !== habitId));
      setTodayCompletions(prev => prev.filter(id => id !== habitId));
      
      // Refresh gamification data to sync XP refund
      await fetchGamificationData();
      
      // Emit event to notify other components
      eventBus.emit(EVENTS.HABIT_DELETED, { habitId });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete habit';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchGamificationData]);

  // Check if habit is completed today
  const isHabitCompletedToday = useCallback((habitId: string) => {
    return todayCompletions.includes(habitId);
  }, [todayCompletions]);

  // Mark habit as complete
  const completeHabit = useCallback(async (habitId: string, date?: Date, timezone?: string) => {
    try {
      // Check if already completed today to prevent duplicate calls
      if (todayCompletions.includes(habitId)) {
        throw new Error('This habit has already been completed today');
      }

      // Optimistically update UI immediately
      setTodayCompletions(prev => {
        if (prev.includes(habitId)) return prev;
        return [...prev, habitId];
      });

      // Update the habit's streak in local state immediately for instant feedback
      setHabits(prev => prev.map(habit => {
        if (habit.id === habitId) {
          return {
            ...habit,
            currentStreak: habit.currentStreak + 1,
            totalCompletions: habit.totalCompletions + 1,
            longestStreak: Math.max(habit.longestStreak, habit.currentStreak + 1)
          };
        }
        return habit;
      }));

      const response = await habitService.markHabitComplete(habitId, date, timezone);
      
      // Always refresh gamification data to sync XP with server
      await fetchGamificationData();
      
      // Handle level up if it occurred
      if (response.leveledUp) {
        // Trigger local level up animation
        addHabitCompletionXP(0, false, false);
      }
      
      // Refresh habits to get accurate stats from server (in background)
      fetchHabits();
      
      // Emit event to notify other components
      eventBus.emit(EVENTS.HABIT_COMPLETED, {
        habitId,
        xpEarned: response.xpEarned || 0,
        leveledUp: response.leveledUp || false,
        newLevel: response.newLevel,
        streakUpdated: true
      });
      
      return response;
    } catch (err) {
      // Revert optimistic update on error
      setTodayCompletions(prev => prev.filter(id => id !== habitId));
      setHabits(prev => prev.map(habit => {
        if (habit.id === habitId) {
          return {
            ...habit,
            currentStreak: Math.max(0, habit.currentStreak - 1),
            totalCompletions: Math.max(0, habit.totalCompletions - 1)
          };
        }
        return habit;
      }));
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete habit';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [todayCompletions, habits, addHabitCompletionXP, fetchGamificationData, fetchHabits]);

  // Get habit statistics
  const getHabitStats = useCallback(async (habitId: string, period: 'week' | 'month' | 'year' = 'month') => {
    try {
      return await habitService.getHabitStats(habitId, period);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch habit stats';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Use forgiveness token
  const useForgiveness = useCallback(async (habitId: string, forgivenessDate: Date, timezone?: string) => {
    try {
      const completion = await habitService.useForgivenessToken(habitId, forgivenessDate, timezone);
      
      // Refresh gamification data to sync forgiveness tokens
      await fetchGamificationData();
      
      // Update local state - refresh habits to get updated streak data
      await fetchHabits();
      
      // Emit event to notify other components
      eventBus.emit(EVENTS.FORGIVENESS_USED, { habitId });
      
      return completion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use forgiveness token';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchHabits, fetchGamificationData]);

  // Get habit completions
  const getHabitCompletions = useCallback(async (habitId: string, days: number = 30) => {
    try {
      return await habitService.getHabitCompletions(habitId, days);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch habit completions';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Get habits by category
  const getHabitsByCategory = useCallback((category?: string) => {
    if (!category) return habits;
    return habits.filter(habit => habit.category === category);
  }, [habits]);

  // Get active habits only
  const getActiveHabits = useCallback(() => {
    return habits.filter(habit => habit.active);
  }, [habits]);

  // Get habits that should be displayed today (filters custom habits by selected days)
  const getDisplayableHabits = useCallback((date: Date = new Date()) => {
    const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
    
    return habits.filter(habit => {
      if (!habit.active) return false;
      
      // Always show daily and weekly habits
      if (habit.frequency === 'daily' || habit.frequency === 'weekly') {
        return true;
      }
      
      // For custom habits, only show if today is a selected day
      if (habit.frequency === 'custom') {
        const selectedDays = habit.customFrequency?.daysOfWeek || [];
        return selectedDays.includes(dayOfWeek);
      }
      
      return true; // Default: show the habit
    });
  }, [habits]);

  // Check if a custom habit should be visible today
  const isHabitVisibleToday = useCallback((habit: any, date: Date = new Date()) => {
    if (habit.frequency !== 'custom') return true;
    
    const dayOfWeek = date.getDay();
    const selectedDays = habit.customFrequency?.daysOfWeek || [];
    return selectedDays.includes(dayOfWeek);
  }, []);

  // Calculate total stats (using local data for immediate display)
  const getTotalStats = useCallback(() => {
    const activeHabits = getActiveHabits();
    const displayableToday = getDisplayableHabits(); // Only habits relevant for today
    const totalHabits = displayableToday.length; // Count only today's habits
    const completedToday = todayCompletions.filter(id => 
      displayableToday.some(h => h.id === id)
    ).length; // Count only completed habits that are relevant today
    const totalCompletions = activeHabits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
    const averageConsistency = activeHabits.length > 0 
      ? activeHabits.reduce((sum, habit) => sum + habit.consistencyRate, 0) / activeHabits.length 
      : 0;
    const longestStreak = Math.max(...activeHabits.map(habit => habit.longestStreak), 0);
    const currentStreaks = activeHabits.reduce((sum, habit) => sum + habit.currentStreak, 0);

    return {
      totalHabits, // Today's relevant habits count
      completedToday, // Today's relevant completed habits
      totalCompletions,
      averageConsistency: Math.round(averageConsistency),
      longestStreak,
      currentStreaks,
      completionRate: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0,
    };
  }, [habits, todayCompletions, getActiveHabits, getDisplayableHabits]);

  // Get analytics overview from server
  const getAnalyticsOverview = useCallback(async (days: number = 30) => {
    try {
      return await analyticsService.getAnalyticsOverview(days);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics overview';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchHabits();
  }, []); // Empty dependency array to run only on mount

  return {
    // State
    habits,
    todayCompletions,
    isLoading,
    error,
    
    // Actions
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    getHabitStats,
    useForgiveness,
    getHabitCompletions,
    
    // Computed values
    isHabitCompletedToday,
    getHabitsByCategory,
    getActiveHabits,
    getDisplayableHabits,
    isHabitVisibleToday,
    getTotalStats,
    getAnalyticsOverview,
    
    // Clear error
    clearError: () => setError(null),
  };
};