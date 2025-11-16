import axios from 'axios';
import { subDays } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK_API = import.meta.env.VITE_MOCK_API === 'true';

export interface MoodEntry {
  id: string;
  userId: string;
  mood: number; // 1-5 scale
  energy: number; // 1-5 scale
  stress: number; // 1-5 scale
  notes?: string;
  date: Date;
  createdAt: Date;
}

export interface WellbeingScore {
  overall: number;
  mood: number;
  energy: number;
  stress: number;
  weeklyChange: number;
  habitCorrelation: number;
}

export interface HabitImpact {
  habitId: string;
  habitName: string;
  category: string;
  color: string;
  moodImpact: number; // -100 to 100
  energyImpact: number;
  stressImpact: number;
  correlation: number | string;
  sampleSize: number;
  completionRate?: number;
  insights?: string[];
  hasEnoughData?: boolean;
  dataStatus?: string;
  daysWithHabit?: number;
  daysWithoutHabit?: number;
}

class WellbeingService {
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

  async getWellbeingScore(): Promise<WellbeingScore> {
    if (USE_MOCK_API) {
      await this.delay(400);
      
      return {
        overall: 78,
        mood: 3.8,
        energy: 3.6,
        stress: 2.4,
        weeklyChange: 12,
        habitCorrelation: 0.73
      };
    }

    try {
      const response = await this.api.get('/wellbeing/score');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch wellbeing score');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getMoodEntries(days: number = 30): Promise<MoodEntry[]> {
    if (USE_MOCK_API) {
      await this.delay(300);
      
      const entries: MoodEntry[] = [];
      for (let i = 0; i < days; i++) {
        const date = subDays(new Date(), i);
        entries.push({
          id: `mood-${i}`,
          userId: '1',
          mood: Math.floor(Math.random() * 2) + 3, // 3-5 range for positive bias
          energy: Math.floor(Math.random() * 2) + 3,
          stress: Math.floor(Math.random() * 3) + 1, // 1-3 range for lower stress
          notes: i % 5 === 0 ? 'Feeling great today!' : undefined,
          date,
          createdAt: date
        });
      }
      
      return entries.reverse(); // Most recent first
    }

    try {
      const response = await this.api.get('/wellbeing/mood-entries', {
        params: { days }
      });
      
      // Handle different response structures
      if (response.data.success && response.data.data) {
        // If the response has moodEntries array
        if (response.data.data.moodEntries) {
          return response.data.data.moodEntries;
        }
        // If the response data is directly the array
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // If the response data is an object, return empty array
        return [];
      }
      
      // Fallback: if response.data is directly an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Default fallback
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch mood entries');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async createMoodEntry(entry: Omit<MoodEntry, 'id' | 'userId' | 'createdAt'>): Promise<MoodEntry> {
    if (USE_MOCK_API) {
      await this.delay(300);
      
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        userId: '1',
        ...entry,
        createdAt: new Date()
      };
      
      return newEntry;
    }

    try {
      const response = await this.api.post('/wellbeing/mood-entries', entry);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create mood entry');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getHabitImpactAnalysis(): Promise<HabitImpact[]> {
    if (USE_MOCK_API) {
      await this.delay(500);
      
      return [
        {
          habitId: '1',
          habitName: 'Morning Exercise',
          category: 'fitness',
          color: '#3B82F6',
          moodImpact: 25,
          energyImpact: 35,
          stressImpact: -20,
          correlation: '0.78',
          sampleSize: 45,
          completionRate: 85,
          insights: ['Improves mood significantly', 'Boosts energy levels', 'Reduces stress']
        },
        {
          habitId: '2',
          habitName: 'Reading',
          category: 'learning',
          color: '#10B981',
          moodImpact: 15,
          energyImpact: 10,
          stressImpact: -15,
          correlation: '0.65',
          sampleSize: 28,
          completionRate: 92,
          insights: ['Enhances mental clarity', 'Provides relaxation']
        },
        {
          habitId: '3',
          habitName: 'Meditation',
          category: 'mindfulness',
          color: '#8B5CF6',
          moodImpact: 30,
          energyImpact: 20,
          stressImpact: -40,
          correlation: '0.85',
          sampleSize: 15,
          completionRate: 78,
          insights: ['Significantly reduces stress', 'Improves emotional balance', 'Enhances focus']
        }
      ];
    }

    try {
      const response = await this.api.get('/wellbeing/habit-impact');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch habit impact analysis');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getWellbeingInsights(): Promise<any> {
    if (USE_MOCK_API) {
      await this.delay(400);
      
      return {
        patterns: [
          {
            type: 'positive',
            title: 'Morning Routine Boost',
            description: 'Your mood is 25% higher on days when you complete your morning exercise.',
            confidence: 0.78
          },
          {
            type: 'insight',
            title: 'Stress Reduction',
            description: 'Meditation sessions correlate with 40% lower stress levels.',
            confidence: 0.85
          },
          {
            type: 'warning',
            title: 'Weekend Dip',
            description: 'Your consistency drops by 30% on weekends, affecting your mood.',
            confidence: 0.65
          }
        ],
        recommendations: [
          'Consider adding a weekend-specific routine to maintain consistency',
          'Your meditation habit has the strongest positive impact - try increasing frequency',
          'Morning exercise shows great results - maintain this timing'
        ],
        weeklyHighlights: {
          bestMoodDay: 'Tuesday',
          highestEnergyDay: 'Monday',
          lowestStressDay: 'Wednesday',
          mostProductiveDay: 'Thursday'
        }
      };
    }

    try {
      const response = await this.api.get('/wellbeing/insights');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch wellbeing insights');
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const wellbeingService = new WellbeingService();