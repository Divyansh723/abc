import { useState, useCallback } from 'react';
import { aiService, type AIInsights, type HabitSuggestion, type PatternAnalysis, type MotivationalContent, type MoodHabitCorrelation } from '@/services/aiService';

export const useAI = () => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);
  const [motivationalContent, setMotivationalContent] = useState<MotivationalContent | null>(null);
  const [moodCorrelation, setMoodCorrelation] = useState<MoodHabitCorrelation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get comprehensive habit insights
  const fetchHabitInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiService.getHabitInsights();
      setInsights(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AI insights';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get smart habit suggestions
  const fetchHabitSuggestions = useCallback(async (goals: string[] = [], preferences: Record<string, any> = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiService.getHabitSuggestions(goals, preferences);
      setSuggestions(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch habit suggestions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Analyze habit patterns
  const analyzeHabitPatterns = useCallback(async (habitId: string): Promise<PatternAnalysis> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiService.analyzeHabitPatterns(habitId);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze habit patterns';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get motivational content
  const fetchMotivationalContent = useCallback(async (context: string = 'daily') => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiService.getMotivationalContent(context);
      setMotivationalContent(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch motivational content';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get mood-habit correlation
  const fetchMoodHabitCorrelation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiService.getMoodHabitCorrelation();
      setMoodCorrelation(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mood-habit correlation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get personalized coaching
  const getPersonalizedCoaching = useCallback(async (challenge?: string, context?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiService.getPersonalizedCoaching(challenge, context);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get personalized coaching';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get habit optimization recommendations
  const getHabitOptimization = useCallback(async (habitId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiService.getHabitOptimization(habitId);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get habit optimization';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear all data
  const clearData = useCallback(() => {
    setInsights(null);
    setSuggestions([]);
    setMotivationalContent(null);
    setMoodCorrelation(null);
    setError(null);
  }, []);

  return {
    // State
    insights,
    suggestions,
    motivationalContent,
    moodCorrelation,
    isLoading,
    error,

    // Actions
    fetchHabitInsights,
    fetchHabitSuggestions,
    analyzeHabitPatterns,
    fetchMotivationalContent,
    fetchMoodHabitCorrelation,
    getPersonalizedCoaching,
    getHabitOptimization,

    // Utilities
    clearError,
    clearData,
  };
};