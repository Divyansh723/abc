import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK_API = import.meta.env.VITE_MOCK_API === 'true';

export interface XPTransaction {
  id: string;
  userId: string;
  habitId?: string;
  amount: number;
  source: 'habit_completion' | 'streak_bonus' | 'achievement' | 'challenge' | 'daily_bonus' | 'level_bonus' | 'other';
  description: string;
  metadata?: {
    streakLength?: number;
    multiplier?: number;
    achievementId?: string;
    challengeId?: string;
    newLevel?: number;
    oldLevel?: number;
  };
  createdAt: Date;
}

export interface GamificationData {
  totalXP: number;
  currentLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercentage: number;
  forgivenessTokens: number;
  achievements: Array<{
    achievementId: string;
    unlockedAt: Date;
    progress: number;
  }>;
  challengeParticipations: Array<{
    challengeId: string;
    joinedAt: Date;
    progress: number;
    completed: boolean;
  }>;
  recentTransactions: XPTransaction[];
}

class GamificationService {
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

  async getGamificationData(): Promise<GamificationData> {
    if (USE_MOCK_API) {
      await this.delay(300);
      // Mock data for development
      return {
        totalXP: 1250,
        currentLevel: 4,
        xpForCurrentLevel: 900,
        xpForNextLevel: 1600,
        progressPercentage: 50,
        forgivenessTokens: 2,
        achievements: [
          {
            achievementId: 'first_habit',
            unlockedAt: new Date('2024-01-01'),
            progress: 100
          }
        ],
        challengeParticipations: [],
        recentTransactions: [
          {
            id: '1',
            userId: '1',
            habitId: 'habit1',
            amount: 15,
            source: 'habit_completion',
            description: 'Completed Morning Exercise',
            metadata: { streakLength: 5, multiplier: 1 },
            createdAt: new Date()
          }
        ]
      };
    }

    try {
      const response = await this.api.get('/gamification/data');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch gamification data');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async addXP(data: {
    amount: number;
    source: string;
    description: string;
    habitId?: string;
    metadata?: any;
  }): Promise<{
    transaction: XPTransaction;
    newTotalXP: number;
    newLevel: number;
    leveledUp: boolean;
    bonusXP: number;
  }> {
    if (USE_MOCK_API) {
      await this.delay(200);
      return {
        transaction: {
          id: Date.now().toString(),
          userId: '1',
          amount: data.amount,
          source: data.source as any,
          description: data.description,
          habitId: data.habitId,
          metadata: data.metadata,
          createdAt: new Date()
        },
        newTotalXP: 1250 + data.amount,
        newLevel: 4,
        leveledUp: false,
        bonusXP: 0
      };
    }

    try {
      const response = await this.api.post('/gamification/xp', data);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to add XP');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async useForgivenessToken(data: {
    habitId: string;
    date: string;
    timezone?: string;
  }): Promise<{
    completion: any;
    remainingTokens: number;
  }> {
    if (USE_MOCK_API) {
      await this.delay(400);
      return {
        completion: {
          id: Date.now().toString(),
          habitId: data.habitId,
          completedAt: new Date(data.date),
          forgivenessUsed: true
        },
        remainingTokens: 2
      };
    }

    try {
      const response = await this.api.post('/gamification/forgiveness', data);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to use forgiveness token');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getXPHistory(params: {
    page?: number;
    limit?: number;
    source?: string;
  } = {}): Promise<{
    transactions: XPTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    if (USE_MOCK_API) {
      await this.delay(300);
      return {
        transactions: [
          {
            id: '1',
            userId: '1',
            habitId: 'habit1',
            amount: 15,
            source: 'habit_completion',
            description: 'Completed Morning Exercise',
            createdAt: new Date()
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1
        }
      };
    }

    try {
      const response = await this.api.get('/gamification/xp/history', { params });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch XP history');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getChallenges(): Promise<any[]> {
    if (USE_MOCK_API) {
      await this.delay(300);
      return [
        {
          id: 'new-habit-challenge',
          name: 'New Habit Challenge',
          description: 'Create and maintain a new habit for 14 days',
          duration: 14,
          rewardXP: 75,
          badgeIcon: '🎯',
          requirements: [
            {
              type: 'streak_length',
              value: 14
            }
          ],
          active: true,
          participants: []
        },
        {
          id: 'perfect-week',
          name: 'Perfect Week',
          description: 'Complete all your habits for 7 consecutive days',
          duration: 7,
          rewardXP: 100,
          badgeIcon: '⭐',
          requirements: [
            {
              type: 'completion_count',
              value: 7
            }
          ],
          active: true,
          participants: []
        },
        {
          id: '7-day-streak-challenge',
          name: '7-Day Streak Challenge',
          description: 'Build a 7-day streak with any habit',
          duration: 7,
          rewardXP: 50,
          badgeIcon: '🔥',
          requirements: [
            {
              type: 'streak_length',
              value: 7
            }
          ],
          active: true,
          participants: []
        }
      ];
    }

    try {
      const response = await this.api.get('/gamification/challenges');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch challenges');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getChallengeParticipations(): Promise<any[]> {
    if (USE_MOCK_API) {
      await this.delay(300);
      
      // Get stored participations from localStorage
      const stored = localStorage.getItem('habitforge-challenge-participations');
      if (stored) {
        try {
          const participations = JSON.parse(stored);
          // Convert date strings back to Date objects
          return participations.map((p: any) => ({
            ...p,
            startDate: new Date(p.startDate),
            endDate: new Date(p.endDate),
            joinedAt: new Date(p.joinedAt)
          }));
        } catch (error) {
          console.warn('Failed to parse stored participations:', error);
        }
      }
      
      return [];
    }

    try {
      const response = await this.api.get('/gamification/challenges/participations');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch challenge participations');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async joinChallenge(challengeId: string): Promise<{
    participation: any;
    message: string;
  }> {
    if (USE_MOCK_API) {
      await this.delay(500);
      
      // Get challenge details to determine duration
      const challenges = await this.getChallenges();
      const challenge = challenges.find(c => c.id === challengeId);
      const duration = challenge?.duration || 7;
      
      const participation = {
        id: Date.now().toString(),
        userId: '1',
        challengeId,
        startDate: new Date(),
        endDate: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)),
        joinedAt: new Date(),
        completed: false,
        progress: 0
      };
      
      // Store in localStorage
      const stored = localStorage.getItem('habitforge-challenge-participations');
      const participations = stored ? JSON.parse(stored) : [];
      participations.push(participation);
      localStorage.setItem('habitforge-challenge-participations', JSON.stringify(participations));
      
      return {
        participation,
        message: 'Successfully joined challenge!'
      };
    }

    try {
      const response = await this.api.post('/gamification/challenges/join', { challengeId });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to join challenge');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async leaveChallenge(challengeId: string): Promise<{
    message: string;
  }> {
    if (USE_MOCK_API) {
      await this.delay(400);
      
      // Remove from localStorage
      const stored = localStorage.getItem('habitforge-challenge-participations');
      if (stored) {
        const participations = JSON.parse(stored);
        const filtered = participations.filter((p: any) => p.challengeId !== challengeId || p.completed);
        localStorage.setItem('habitforge-challenge-participations', JSON.stringify(filtered));
      }
      
      return {
        message: 'Successfully left challenge'
      };
    }

    try {
      const response = await this.api.post('/gamification/challenges/leave', { challengeId });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to leave challenge');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async updateChallengeProgress(challengeId: string, progress: number): Promise<{
    participation: any;
    completed: boolean;
    xpEarned: number;
  }> {
    if (USE_MOCK_API) {
      await this.delay(300);
      return {
        participation: {
          challengeId,
          progress,
          completed: progress >= 100
        },
        completed: progress >= 100,
        xpEarned: progress >= 100 ? 50 : 0
      };
    }

    try {
      const response = await this.api.post('/gamification/challenges/progress', { challengeId, progress });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update challenge progress');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getAchievements(): Promise<any[]> {
    if (USE_MOCK_API) {
      await this.delay(300);
      return [
        {
          id: 'first-habit',
          name: 'First Steps',
          description: 'Complete your first habit and start your journey',
          icon: '🎯',
          rarity: 'common',
          category: 'milestone',
          requirement: 'Complete 1 habit',
          progress: 0,
          maxProgress: 1,
          unlockedAt: null,
          xpReward: 10,
          workNeeded: 'Complete any habit once to unlock this achievement'
        },
        {
          id: 'habit-creator',
          name: 'Habit Creator',
          description: 'Create your first 3 habits',
          icon: '🏗️',
          rarity: 'common',
          category: 'milestone',
          requirement: 'Create 3 habits',
          progress: 0,
          maxProgress: 3,
          unlockedAt: null,
          xpReward: 15,
          workNeeded: 'Go to Goals page and create 3 different habits'
        },
        {
          id: 'week-warrior',
          name: 'Week Warrior',
          description: 'Maintain a 7-day streak with any habit',
          icon: '🔥',
          rarity: 'rare',
          category: 'streak',
          requirement: 'Maintain 7-day streak',
          progress: 0,
          maxProgress: 7,
          unlockedAt: null,
          xpReward: 25,
          workNeeded: 'Complete the same habit for 7 consecutive days without missing'
        }
      ];
    }

    try {
      const response = await this.api.get('/gamification/achievements');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch achievements');
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const gamificationService = new GamificationService();