import axios from 'axios';
import { type Completion } from '@/types/habit';
import { format, subDays } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK_API = import.meta.env.VITE_MOCK_API === 'true';

export interface TrendDataPoint {
  date: string;
  value: number;
  label: string;
}

export interface WeeklySummaryData {
  completions: Completion[];
  totalHabits: number;
  weeklyStats: {
    totalCompletions: number;
    averageCompletionRate: number;
    bestDay: string;
    worstDay: string;
  };
}

export interface ConsistencyData {
  date: string;
  completions: number;
  totalHabits: number;
  completionRate: number;
}

class AnalyticsService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private getStoredToken(): string | null {
    try {
      const authData = localStorage.getItem('habitforge-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.warn('Failed to get stored token:', error);
    }
    return null;
  }

  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async getAnalyticsOverview(days: number = 30): Promise<{
    totalHabits: number;
    totalCompletions: number;
    todayCompletions: number;
    consistencyRate: number;
    uniqueDaysWithCompletions: number;
    longestStreak: number;
    currentStreaks: number;
    completionRate: number;
  }> {
    if (USE_MOCK_API) {
      await this.delay(300);
      return {
        totalHabits: 5,
        totalCompletions: 45,
        todayCompletions: 3,
        consistencyRate: 75,
        uniqueDaysWithCompletions: 20,
        longestStreak: 12,
        currentStreaks: 8,
        completionRate: 60
      };
    }

    try {
      const response = await this.api.get('/analytics/overview', {
        params: { days }
      });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch analytics overview');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getTrendData(days: number = 30): Promise<TrendDataPoint[]> {
    if (USE_MOCK_API) {
      await this.delay(400);
      
      const data: TrendDataPoint[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const completionRate = Math.floor(Math.random() * 40) + 60; // 60-100%
        data.push({
          date: format(date, 'MMM dd'),
          value: completionRate,
          label: format(date, 'yyyy-MM-dd')
        });
      }
      return data;
    }

    try {
      const response = await this.api.get('/analytics/trends', {
        params: { days }
      });
      const data = response.data.success ? response.data.data : response.data;
      
      // Transform server data to match frontend expectations
      return data.map((item: any) => ({
        date: format(new Date(item.date), 'MMM dd'),
        value: item.completions,
        label: item.date
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch trend data');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getWeeklySummary(): Promise<WeeklySummaryData> {
    if (USE_MOCK_API) {
      await this.delay(300);
      
      const mockCompletions: Completion[] = [];
      
      // Generate mock completions for the week
      for (let i = 0; i < 7; i++) {
        const date = subDays(new Date(), 6 - i);
        const numCompletions = Math.floor(Math.random() * 4) + 1;
        
        for (let j = 0; j < numCompletions; j++) {
          mockCompletions.push({
            id: `${i}-${j}`,
            habitId: `habit-${j}`,
            userId: '1',
            completedAt: date,
            deviceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            xpEarned: 10,
            editedFlag: false,
            createdAt: date,
          });
        }
      }

      return {
        completions: mockCompletions,
        totalHabits: 5,
        weeklyStats: {
          totalCompletions: mockCompletions.length,
          averageCompletionRate: 78,
          bestDay: 'Wednesday',
          worstDay: 'Sunday'
        }
      };
    }

    try {
      const response = await this.api.get('/analytics/weekly-summary');
      const data = response.data.success ? response.data.data : response.data;
      
      // Ensure data structure is correct
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid weekly summary data received');
      }
      
      return {
        completions: Array.isArray(data.completions) ? data.completions : [],
        totalHabits: typeof data.totalHabits === 'number' ? data.totalHabits : 0,
        weeklyStats: data.weeklyStats || {
          totalCompletions: 0,
          averageCompletionRate: 0,
          bestDay: 'Monday',
          worstDay: 'Sunday'
        }
      };
    } catch (error) {
      console.error('Weekly summary fetch error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch weekly summary');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getConsistencyData(month: Date): Promise<ConsistencyData[]> {
    if (USE_MOCK_API) {
      await this.delay(350);
      
      const data: ConsistencyData[] = [];
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const completions = Math.floor(Math.random() * 6);
        const totalHabits = 5;
        
        data.push({
          date: format(date, 'yyyy-MM-dd'),
          completions,
          totalHabits,
          completionRate: Math.round((completions / totalHabits) * 100)
        });
      }
      
      return data;
    }

    try {
      const response = await this.api.get('/analytics/consistency', {
        params: {
          month: format(month, 'yyyy-MM')
        }
      });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch consistency data');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getHabitPerformance(timeRange: '7d' | '30d' | '90d' = '30d') {
    if (USE_MOCK_API) {
      await this.delay(400);
      
      const habits = [
        { id: '1', name: 'Morning Exercise', completionRate: 85, totalCompletions: 25 },
        { id: '2', name: 'Reading', completionRate: 92, totalCompletions: 28 },
        { id: '3', name: 'Meditation', completionRate: 78, totalCompletions: 22 },
        { id: '4', name: 'Water Intake', completionRate: 95, totalCompletions: 29 },
        { id: '5', name: 'Journaling', completionRate: 67, totalCompletions: 20 },
      ];

      return {
        habits,
        timeRange,
        averageCompletionRate: Math.round(habits.reduce((acc, h) => acc + h.completionRate, 0) / habits.length)
      };
    }

    try {
      const response = await this.api.get('/analytics/habit-performance', {
        params: { timeRange }
      });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch habit performance');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async exportData(exportType: string, dateRange: string = 'all_time') {
    try {
      const response = await this.api.get('/analytics/export', {
        params: { exportType, dateRange }
      });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to export data');
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const analyticsService = new AnalyticsService();