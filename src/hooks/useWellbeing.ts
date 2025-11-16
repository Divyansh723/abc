import { useState, useEffect, useCallback } from 'react';
import { wellbeingService, type MoodEntry, type WellbeingScore, type HabitImpact } from '@/services/wellbeingService';
import { eventBus, EVENTS } from '@/utils/eventBus';

export const useWellbeing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wellbeingScore, setWellbeingScore] = useState<WellbeingScore | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [habitImpacts, setHabitImpacts] = useState<HabitImpact[]>([]);
  const [insights, setInsights] = useState<any>(null);

  const fetchWellbeingScore = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const score = await wellbeingService.getWellbeingScore();
      setWellbeingScore(score);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wellbeing score';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMoodEntries = useCallback(async (days: number = 30) => {
    try {
      setIsLoading(true);
      setError(null);
      const entries = await wellbeingService.getMoodEntries(days);
      
      // Ensure all dates are properly converted to Date objects
      const normalizedEntries = entries.map(entry => ({
        ...entry,
        date: entry.date ? new Date(entry.date) : new Date(),
        createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date()
      }));
      
      setMoodEntries(normalizedEntries);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mood entries';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMoodEntry = useCallback(async (entry: Omit<MoodEntry, 'id' | 'userId' | 'createdAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newEntry = await wellbeingService.createMoodEntry(entry);
      
      // Ensure date is properly converted to Date object
      const normalizedEntry = {
        ...newEntry,
        date: newEntry.date ? new Date(newEntry.date) : new Date(),
        createdAt: newEntry.createdAt ? new Date(newEntry.createdAt) : new Date()
      };
      
      setMoodEntries(prev => [normalizedEntry, ...prev]);
      
      // Emit event to notify other components
      eventBus.emit(EVENTS.MOOD_LOGGED, normalizedEntry);
      
      return normalizedEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create mood entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHabitImpacts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const impacts = await wellbeingService.getHabitImpactAnalysis();
      setHabitImpacts(impacts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch habit impacts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const insightsData = await wellbeingService.getWellbeingInsights();
      setInsights(insightsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch insights';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch all wellbeing data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchWellbeingScore(),
        fetchMoodEntries(),
        fetchHabitImpacts(),
        fetchInsights()
      ]);
    };
    
    initializeData();
  }, []); // Empty dependency array to run only on mount

  return {
    // State
    isLoading,
    error,
    wellbeingScore,
    moodEntries,
    habitImpacts,
    insights,
    
    // Actions
    fetchWellbeingScore,
    fetchMoodEntries,
    createMoodEntry,
    fetchHabitImpacts,
    fetchInsights,
  };
};