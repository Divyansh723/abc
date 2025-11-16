import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get stored token
const getStoredToken = (): string | null => {
  try {
    const authData = localStorage.getItem('habitforge-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.token || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PersonalChallenge {
  _id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  requirements: {
    type: 'streak' | 'total_completions' | 'consistency';
    target: number;
    habitCategories: string[];
  };
  xpReward: number;
  isActive: boolean;
  userStatus?: {
    isActive: boolean;
    completedCount: number;
    activeParticipationId?: string;
  };
  userHistory?: {
    activeParticipation?: ChallengeParticipation;
    completedCount: number;
    bestTime?: number;
    totalXpEarned: number;
  };
}

export interface ChallengeParticipation {
  _id: string;
  userId: string;
  challengeId: string | PersonalChallenge;
  status: 'active' | 'completed' | 'abandoned';
  startDate: string;
  endDate?: string;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  completionStats?: {
    daysToComplete: number;
    finalScore: number;
  };
  xpAwarded: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeHistory {
  challenge: PersonalChallenge;
  completedCount: number;
  abandonedCount: number;
  totalXpEarned: number;
  bestTime?: number;
  lastAttempt?: string;
}

class ChallengeService {
  // Get all available personal challenges
  async getAllChallenges(): Promise<PersonalChallenge[]> {
    try {
      const response = await api.get('/challenges/personal');
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw new Error('Failed to fetch challenges');
    }
  }

  // Get specific challenge details
  async getChallengeById(id: string): Promise<PersonalChallenge> {
    try {
      const response = await api.get(`/challenges/personal/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw new Error('Failed to fetch challenge details');
    }
  }

  // Join a challenge
  async joinChallenge(challengeId: string): Promise<{ message: string; participation: ChallengeParticipation }> {
    try {
      const response = await api.post(`/challenges/personal/${challengeId}/join`);
      return response.data;
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      // Extract the error message from the API response
      const message = error.response?.data?.message || 'Failed to join challenge';
      throw new Error(message);
    }
  }

  // Get user's active participations
  async getActiveParticipations(): Promise<ChallengeParticipation[]> {
    try {
      const response = await api.get('/challenges/personal/participations/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active participations:', error);
      throw new Error('Failed to fetch active participations');
    }
  }

  // Abandon a participation
  async abandonParticipation(participationId: string): Promise<{ message: string }> {
    try {
      const response = await api.post(`/challenges/personal/participations/${participationId}/abandon`);
      return response.data;
    } catch (error) {
      console.error('Error abandoning challenge:', error);
      throw new Error('Failed to abandon challenge');
    }
  }

  // Get user's challenge history
  async getChallengeHistory(): Promise<ChallengeHistory[]> {
    try {
      const response = await api.get('/challenges/personal/history/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching challenge history:', error);
      throw new Error('Failed to fetch challenge history');
    }
  }

  // Helper method to get difficulty color
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'hard':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  }

  // Helper method to get challenge type display name
  getTypeDisplayName(type: string): string {
    switch (type) {
      case 'streak':
        return 'Streak Challenge';
      case 'total_completions':
        return 'Completion Challenge';
      case 'consistency':
        return 'Consistency Challenge';
      default:
        return 'Challenge';
    }
  }

  // Helper method to format duration
  formatDuration(days: number): string {
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days === 7) return '1 week';
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    if (days === 30) return '1 month';
    return `${Math.floor(days / 30)} months`;
  }
}

export const challengeService = new ChallengeService();
export default challengeService;
