import axios from 'axios';
import { type Habit, type Completion, type HabitStats } from '@/types/habit';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK_API = import.meta.env.VITE_MOCK_API === 'true';

// Mock data storage keys
const HABITS_STORAGE_KEY = 'habitforge-habits';
const COMPLETIONS_STORAGE_KEY = 'habitforge-completions';

// Initialize mock data with localStorage persistence
const getStoredHabits = (): Habit[] => {
  try {
    const stored = localStorage.getItem(HABITS_STORAGE_KEY);
    if (stored) {
      const habits = JSON.parse(stored);
      // Convert date strings back to Date objects
      return habits.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        updatedAt: new Date(habit.updatedAt),
      }));
    }
  } catch (error) {
    console.warn('Failed to load stored habits:', error);
  }

  // Return default habits if none stored
  return [
    {
      id: '1',
      userId: '1',
      name: 'Morning Exercise',
      description: 'Start the day with 30 minutes of exercise',
      category: 'fitness',
      frequency: 'daily',
      reminderTime: '07:00',
      reminderEnabled: true,
      color: '#3B82F6',
      icon: '💪',
      active: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      currentStreak: 12,
      longestStreak: 25,
      totalCompletions: 45,
      consistencyRate: 85,
    },
    {
      id: '2',
      userId: '1',
      name: 'Read for 20 minutes',
      description: 'Daily reading to expand knowledge and vocabulary',
      category: 'learning',
      frequency: 'daily',
      reminderTime: '20:00',
      reminderEnabled: true,
      color: '#10B981',
      icon: '📚',
      active: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      currentStreak: 8,
      longestStreak: 15,
      totalCompletions: 28,
      consistencyRate: 92,
    },
    {
      id: '3',
      userId: '1',
      name: 'Meditation',
      description: '10 minutes of mindfulness meditation',
      category: 'mindfulness',
      frequency: 'daily',
      reminderTime: '08:00',
      reminderEnabled: true,
      color: '#8B5CF6',
      icon: '🧘',
      active: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      currentStreak: 5,
      longestStreak: 10,
      totalCompletions: 15,
      consistencyRate: 78,
    },
  ];
};

const getStoredCompletions = (): Completion[] => {
  try {
    const stored = localStorage.getItem(COMPLETIONS_STORAGE_KEY);
    if (stored) {
      const completions = JSON.parse(stored);
      return completions.map((completion: any) => ({
        ...completion,
        completedAt: new Date(completion.completedAt),
        createdAt: new Date(completion.createdAt),
      }));
    }
  } catch (error) {
    console.warn('Failed to load stored completions:', error);
  }
  return [];
};

const saveHabitsToStorage = (habits: Habit[]) => {
  try {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  } catch (error) {
    console.warn('Failed to save habits to storage:', error);
  }
};

const saveCompletionsToStorage = (completions: Completion[]) => {
  try {
    localStorage.setItem(COMPLETIONS_STORAGE_KEY, JSON.stringify(completions));
  } catch (error) {
    console.warn('Failed to save completions to storage:', error);
  }
};

// Initialize with stored data
let mockHabits: Habit[] = getStoredHabits();
let mockCompletions: Completion[] = getStoredCompletions();

class HabitService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor to include auth token
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



  async getUserHabits(): Promise<Habit[]> {
    if (USE_MOCK_API) {
      await this.delay(500);
      return [...mockHabits];
    }

    try {
      const response = await this.api.get('/habits');

      // Backend returns { success: true, data: { habits } }
      // Frontend expects array of habits
      if (response.data.success && response.data.data) {
        return response.data.data.habits || [];
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch habits');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async createHabit(habitData: Partial<Habit>): Promise<Habit> {
    console.log('HabitService: Creating habit with USE_MOCK_API =', USE_MOCK_API);
    console.log('HabitService: Habit data received:', habitData);

    if (USE_MOCK_API) {
      await this.delay(800);

      const newHabit: Habit = {
        id: Date.now().toString(),
        userId: '1',
        name: habitData.name || 'New Habit',
        description: habitData.description || undefined,
        category: habitData.category || 'other',
        frequency: habitData.frequency || 'daily',
        reminderTime: habitData.reminderTime || undefined,
        reminderEnabled: habitData.reminderEnabled || false,
        color: habitData.color || '#3B82F6',
        icon: habitData.icon || '🎯',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        consistencyRate: 0,
      };

      console.log('HabitService: Created new habit:', newHabit);
      mockHabits.push(newHabit);
      saveHabitsToStorage(mockHabits);
      console.log('HabitService: Total habits now:', mockHabits.length);
      return newHabit;
    }

    try {
      const response = await this.api.post<Habit>('/habits', habitData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create habit');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    if (USE_MOCK_API) {
      await this.delay(600);

      const habitIndex = mockHabits.findIndex(h => h.id === habitId);
      if (habitIndex === -1) {
        throw new Error('Habit not found');
      }

      const updatedHabit = {
        ...mockHabits[habitIndex],
        ...updates,
        updatedAt: new Date(),
      };

      mockHabits[habitIndex] = updatedHabit;
      saveHabitsToStorage(mockHabits);
      return updatedHabit;
    }

    try {
      const response = await this.api.patch<Habit>(`/habits/${habitId}`, updates);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update habit');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    if (USE_MOCK_API) {
      await this.delay(400);

      const habitIndex = mockHabits.findIndex(h => h.id === habitId);
      if (habitIndex === -1) {
        throw new Error('Habit not found');
      }

      mockHabits.splice(habitIndex, 1);
      saveHabitsToStorage(mockHabits);
      return;
    }

    try {
      await this.api.delete(`/habits/${habitId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete habit');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async markHabitComplete(habitId: string, date?: Date, timezone?: string): Promise<any> {
    if (USE_MOCK_API) {
      await this.delay(300);

      const habit = mockHabits.find(h => h.id === habitId);
      if (!habit) {
        throw new Error('Habit not found');
      }

      // Check if already completed today
      const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const completionDate = date || new Date();

      // Check for existing completion on the same day
      const existingCompletion = mockCompletions.find(c => {
        if (c.habitId !== habitId) return false;
        const completionDay = new Date(c.completedAt).toDateString();
        const targetDay = completionDate.toDateString();
        return completionDay === targetDay;
      });

      if (existingCompletion) {
        throw new Error('This habit has already been completed for the selected date');
      }

      const completion: Completion = {
        id: Date.now().toString(),
        habitId,
        userId: '1',
        completedAt: completionDate,
        deviceTimezone: userTimezone,
        xpEarned: 10,
        editedFlag: false,
        createdAt: new Date(),
      };

      mockCompletions.push(completion);
      saveCompletionsToStorage(mockCompletions);

      // Update habit stats
      habit.totalCompletions += 1;
      habit.currentStreak += 1;
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
      habit.consistencyRate = Math.min(95, habit.consistencyRate + 2);
      habit.updatedAt = new Date();

      // Save updated habits
      saveHabitsToStorage(mockHabits);

      // Update challenge progress
      this.updateChallengeProgress();

      return completion;
    }

    try {
      const response = await this.api.post(`/habits/${habitId}/complete`, {
        date: date?.toISOString(),
        timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      // Server returns { success: true, data: { completion, xpEarned, leveledUp, ... } }
      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to mark habit as complete');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getHabitStats(habitId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<HabitStats> {
    if (USE_MOCK_API) {
      await this.delay(400);

      const habit = mockHabits.find(h => h.id === habitId);
      if (!habit) {
        throw new Error('Habit not found');
      }

      return {
        totalCompletions: habit.totalCompletions,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        consistencyRate: habit.consistencyRate,
        averageXPPerDay: Math.round(habit.totalCompletions * 10 / 30),
        totalActiveDays: Math.round(habit.totalCompletions * 1.2),
      };
    }

    try {
      const response = await this.api.get<HabitStats>(`/habits/${habitId}/stats`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch habit stats');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getTodayCompletions(): Promise<string[]> {
    if (USE_MOCK_API) {
      await this.delay(200);
      // Return some mock completed habit IDs for today
      return ['1']; // Assuming habit with ID '1' is completed today
    }

    try {
      const response = await this.api.get('/habits/completions/today');

      // Backend returns { success: true, data: [...] }
      // Frontend expects array of habit IDs
      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch today\'s completions');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async useForgivenessToken(habitId: string, forgivenessDate: Date, timezone?: string): Promise<Completion> {
    if (USE_MOCK_API) {
      await this.delay(400);

      const habit = mockHabits.find(h => h.id === habitId);
      if (!habit) {
        throw new Error('Habit not found');
      }

      const completion: Completion = {
        id: Date.now().toString(),
        habitId,
        userId: '1',
        completedAt: forgivenessDate,
        deviceTimezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        xpEarned: 5, // Less XP for forgiveness token
        editedFlag: true,
        createdAt: new Date(),
      };

      mockCompletions.push(completion);
      saveCompletionsToStorage(mockCompletions);
      return completion;
    }

    try {
      const response = await this.api.post<Completion>(`/habits/${habitId}/forgiveness`, {
        date: forgivenessDate.toISOString(),
        timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to use forgiveness token');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getHabitCompletions(habitId: string, days: number = 30): Promise<Completion[]> {
    if (USE_MOCK_API) {
      await this.delay(300);

      // Return mock completions for the habit
      return mockCompletions.filter(c => c.habitId === habitId).slice(0, days);
    }

    try {
      const response = await this.api.get<Completion[]>(`/habits/${habitId}/completions`, {
        params: { days },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch habit completions');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async recalculateHabitStats(): Promise<{ habitsUpdated: number }> {
    if (USE_MOCK_API) {
      await this.delay(1000);

      // Mock recalculation - just return the number of habits
      return { habitsUpdated: mockHabits.length };
    }

    try {
      const response = await this.api.post('/habits/recalculate-stats');

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to recalculate habit statistics');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  private updateChallengeProgress() {
    try {
      const stored = localStorage.getItem('habitforge-challenge-participations');
      if (!stored) return;

      const participations = JSON.parse(stored);
      // const today = new Date().toDateString();

      // Get today's completions (not currently used but kept for future reference)
      // const todayCompletions = mockCompletions.filter(c =>
      //   new Date(c.completedAt).toDateString() === today
      // );

      // Update each active participation
      const updated = participations.map((p: any) => {
        if (p.completed) return p;

        const startDate = new Date(p.startDate);
        const endDate = new Date(p.endDate);
        const now = new Date();

        // Calculate days elapsed
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        // const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // Get completions since challenge started
        const challengeCompletions = mockCompletions.filter(c => {
          const completionDate = new Date(c.completedAt);
          return completionDate >= startDate && completionDate <= now;
        });

        // Get unique days with completions
        const uniqueDays = new Set(
          challengeCompletions.map(c => new Date(c.completedAt).toDateString())
        );

        // Calculate progress based on challenge requirements
        // For "Perfect Week" - need to complete habits every day
        const progress = Math.min(100, (uniqueDays.size / totalDays) * 100);

        return {
          ...p,
          progress,
          completed: progress >= 100
        };
      });

      localStorage.setItem('habitforge-challenge-participations', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to update challenge progress:', error);
    }
  }
}

export const habitService = new HabitService();