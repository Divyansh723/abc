import { useState, useCallback } from 'react';
import { analyticsService, type TrendDataPoint, type WeeklySummaryData, type ConsistencyData } from '@/services/analyticsService';

export const useAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null);
  const [consistencyData, setConsistencyData] = useState<ConsistencyData[]>([]);
  const [habitPerformance, setHabitPerformance] = useState<any>(null);
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);

  const fetchTrendData = useCallback(async (days: number = 30) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsService.getTrendData(days);
      setTrendData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trend data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWeeklySummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsService.getWeeklySummary();
      
      // Validate data structure
      if (data && typeof data === 'object' && Array.isArray(data.completions)) {
        setWeeklySummary(data);
      } else {
        console.warn('Invalid weekly summary data structure:', data);
        setWeeklySummary({
          completions: [],
          totalHabits: 0,
          weeklyStats: {
            totalCompletions: 0,
            averageCompletionRate: 0,
            bestDay: 'Monday',
            worstDay: 'Sunday'
          }
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weekly summary';
      console.error('Weekly summary fetch error:', err);
      setError(errorMessage);
      // Set fallback data to prevent crashes
      setWeeklySummary({
        completions: [],
        totalHabits: 0,
        weeklyStats: {
          totalCompletions: 0,
          averageCompletionRate: 0,
          bestDay: 'Monday',
          worstDay: 'Sunday'
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnalyticsOverview = useCallback(async (days: number = 30) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsService.getAnalyticsOverview(days);
      setAnalyticsOverview(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics overview';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchConsistencyData = useCallback(async (month: Date) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsService.getConsistencyData(month);
      setConsistencyData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch consistency data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHabitPerformance = useCallback(async (timeRange: '7d' | '30d' | '90d' = '30d') => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsService.getHabitPerformance(timeRange);
      setHabitPerformance(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch habit performance';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportData = useCallback(async (exportType: string, dateRange: string = 'all_time') => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await analyticsService.exportData(exportType, dateRange);
      
      // Create and trigger download
      const blob = new Blob([result.data], { 
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    trendData,
    weeklySummary,
    consistencyData,
    habitPerformance,
    analyticsOverview,
    
    // Actions
    fetchTrendData,
    fetchWeeklySummary,
    fetchConsistencyData,
    fetchHabitPerformance,
    fetchAnalyticsOverview,
    exportData,
  };
};