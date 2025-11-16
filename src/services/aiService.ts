import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK_API = import.meta.env.VITE_MOCK_API === 'true';

// Types for AI responses
export interface HabitInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'pattern';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface HabitRecommendation {
  habitId?: string;
  type: 'optimize' | 'modify' | 'new' | 'pause';
  title: string;
  description: string;
  expectedImpact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIInsights {
  overallProgress: {
    summary: string;
    score: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  keyInsights: HabitInsight[];
  habitRecommendations: HabitRecommendation[];
  motivationalMessage: string;
  nextSteps: string[];
}

export interface HabitSuggestion {
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeCommitment: string;
  expectedBenefits: string[];
  startingTips: string[];
  frequency: 'daily' | 'weekly';
  icon: string;
  color: string;
  reasoning: string;
}

export interface PatternAnalysis {
  patterns: {
    bestDays: string[];
    bestTimes: string[];
    consistencyScore: number;
    streakPatterns: string;
  };
  predictions: {
    optimalSchedule: string;
    riskFactors: string[];
    successFactors: string[];
  };
  recommendations: string[];
}

export interface MotivationalContent {
  message: string;
  tone: 'encouraging' | 'celebratory' | 'supportive' | 'energizing';
  quote: string;
  tips: string[];
  challenge?: string;
  affirmation: string;
}

export interface MoodHabitCorrelation {
  correlations: Array<{
    habitName: string;
    moodImpact: 'positive' | 'negative' | 'neutral';
    strength: 'strong' | 'moderate' | 'weak';
    description: string;
  }>;
  insights: string[];
  recommendations: string[];
  moodPatterns: {
    bestMoodDays: string[];
    challengingDays: string[];
    moodTrends: string;
  };
}

// Mock data for development
const mockInsights: AIInsights = {
  overallProgress: {
    summary: "You're making excellent progress with consistent habit building. Your streak patterns show strong commitment, especially in the morning routines.",
    score: 87,
    trend: 'improving'
  },
  keyInsights: [
    {
      type: 'strength',
      title: 'Morning Routine Mastery',
      description: 'Your morning habits have a 95% completion rate, showing excellent consistency in the first half of the day.',
      actionable: true,
      priority: 'high'
    },
    {
      type: 'opportunity',
      title: 'Evening Habit Gap',
      description: 'Evening habits show lower consistency. Consider linking them to existing strong habits.',
      actionable: true,
      priority: 'medium'
    },
    {
      type: 'pattern',
      title: 'Weekend Dip',
      description: 'Completion rates drop by 30% on weekends. This is common but addressable.',
      actionable: true,
      priority: 'medium'
    }
  ],
  habitRecommendations: [
    {
      type: 'optimize',
      title: 'Optimize Reading Time',
      description: 'Move reading habit to right after morning coffee for better consistency.',
      expectedImpact: 'high',
      difficulty: 'easy'
    },
    {
      type: 'new',
      title: 'Add Evening Wind-down',
      description: 'A 5-minute evening reflection could improve sleep and next-day performance.',
      expectedImpact: 'medium',
      difficulty: 'easy'
    }
  ],
  motivationalMessage: "You're building incredible momentum! Your consistency in morning routines is inspiring. Keep leveraging this strength while gradually improving evening habits.",
  nextSteps: [
    'Link evening habits to strong morning routine triggers',
    'Set weekend-specific reminders for habit maintenance',
    'Celebrate your morning routine success - you\'ve mastered it!'
  ]
};

const mockSuggestions: HabitSuggestion[] = [
  {
    name: 'Gratitude Journaling',
    description: 'Write down 3 things you\'re grateful for each day to boost positivity and mental well-being.',
    category: 'mindfulness',
    difficulty: 'easy',
    timeCommitment: '3-5 minutes',
    expectedBenefits: ['Improved mood', 'Better sleep', 'Increased life satisfaction'],
    startingTips: ['Keep journal by bedside', 'Start with just one gratitude item', 'Be specific in your entries'],
    frequency: 'daily',
    icon: '🙏',
    color: '#8B5CF6',
    reasoning: 'Based on your meditation habit, this complements your mindfulness practice and can enhance your evening routine.'
  },
  {
    name: 'Hydration Tracking',
    description: 'Drink 8 glasses of water daily to improve energy, focus, and overall health.',
    category: 'health',
    difficulty: 'easy',
    timeCommitment: 'Throughout day',
    expectedBenefits: ['Better energy', 'Clearer skin', 'Improved focus'],
    startingTips: ['Use a marked water bottle', 'Set hourly reminders', 'Start with current intake + 1 glass'],
    frequency: 'daily',
    icon: '💧',
    color: '#3B82F6',
    reasoning: 'Your exercise habit shows commitment to health. Proper hydration will enhance your workout performance and recovery.'
  }
];

class AIService {
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

  async getHabitInsights(): Promise<AIInsights> {
    if (USE_MOCK_API) {
      await this.delay(2000); // Simulate AI processing time
      return mockInsights;
    }

    try {
      const response = await this.api.get('/ai/insights');
      
      // Handle different response formats
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('AI Insights API Error:', error);
      
      // Check if AI is disabled
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        const errorData = error.response.data;
        if (errorData.code === 'AI_DISABLED') {
          throw new Error('AI_DISABLED');
        }
      }
      
      // Fallback to mock data if API fails
      if (axios.isAxiosError(error)) {
        console.warn('Falling back to mock insights due to API error:', error.response?.data?.message);
        return mockInsights;
      }
      
      // Return mock data as fallback
      return mockInsights;
    }
  }

  async getHabitSuggestions(goals: string[] = [], preferences: Record<string, any> = {}): Promise<HabitSuggestion[]> {
    if (USE_MOCK_API) {
      await this.delay(1500);
      return mockSuggestions;
    }

    try {
      const response = await this.api.post('/ai/suggestions', { goals, preferences });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get habit suggestions');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async analyzeHabitPatterns(habitId: string): Promise<PatternAnalysis> {
    if (USE_MOCK_API) {
      await this.delay(1800);
      return {
        patterns: {
          bestDays: ['Monday', 'Tuesday', 'Wednesday'],
          bestTimes: ['morning', 'early evening'],
          consistencyScore: 85,
          streakPatterns: 'Strong weekday performance with weekend challenges'
        },
        predictions: {
          optimalSchedule: 'Best performed in the morning between 7-9 AM on weekdays',
          riskFactors: ['Weekend schedule changes', 'Travel days', 'High stress periods'],
          successFactors: ['Morning routine anchor', 'Consistent sleep schedule', 'Preparation the night before']
        },
        recommendations: [
          'Set weekend-specific reminders to maintain consistency',
          'Prepare materials the night before to reduce friction',
          'Consider a simplified version for challenging days'
        ]
      };
    }

    try {
      const response = await this.api.get(`/ai/patterns/${habitId}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to analyze habit patterns');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getMotivationalContent(context: string = 'daily'): Promise<MotivationalContent> {
    if (USE_MOCK_API) {
      await this.delay(800);
      return {
        message: "Every small step you take today builds the foundation for tomorrow's success. Your consistency is your superpower!",
        tone: 'encouraging',
        quote: "Success is the sum of small efforts repeated day in and day out. - Robert Collier",
        tips: [
          'Focus on progress, not perfection',
          'Celebrate small wins along the way',
          'Remember why you started this journey'
        ],
        challenge: 'Complete all your morning habits before checking your phone today',
        affirmation: 'I am building positive habits that transform my life one day at a time.'
      };
    }

    try {
      const response = await this.api.get('/ai/motivation', { params: { context } });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('AI Motivation API Error:', error);
      
      // Fallback to default motivational content
      return {
        message: "Every small step you take today builds the foundation for tomorrow's success. Your consistency is your superpower!",
        tone: 'encouraging',
        quote: "Success is the sum of small efforts repeated day in and day out. - Robert Collier",
        tips: [
          'Focus on progress, not perfection',
          'Celebrate small wins along the way',
          'Remember why you started this journey'
        ],
        challenge: 'Complete all your morning habits before checking your phone today',
        affirmation: 'I am building positive habits that transform my life one day at a time.'
      };
    }
  }

  async getMoodHabitCorrelation(): Promise<MoodHabitCorrelation> {
    if (USE_MOCK_API) {
      await this.delay(2200);
      return {
        correlations: [
          {
            habitName: 'Morning Exercise',
            moodImpact: 'positive',
            strength: 'strong',
            description: 'Exercise significantly boosts your mood and energy levels throughout the day'
          },
          {
            habitName: 'Reading',
            moodImpact: 'positive',
            strength: 'moderate',
            description: 'Reading sessions correlate with improved evening mood and better sleep quality'
          }
        ],
        insights: [
          'Your mood is 40% higher on days when you complete your morning exercise',
          'Reading before bed improves next-day mood by an average of 25%',
          'Meditation practice shows the strongest correlation with stress reduction'
        ],
        recommendations: [
          'Prioritize morning exercise on days when you anticipate stress',
          'Use reading as a mood booster during challenging periods',
          'Consider adding a brief meditation session during lunch breaks'
        ],
        moodPatterns: {
          bestMoodDays: ['Tuesday', 'Wednesday', 'Thursday'],
          challengingDays: ['Monday', 'Sunday'],
          moodTrends: 'Generally improving with consistent habit practice, with midweek peaks'
        }
      };
    }

    try {
      const response = await this.api.get('/ai/mood-correlation');
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to analyze mood-habit correlation');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getPersonalizedCoaching(challenge?: string, context?: string): Promise<MotivationalContent & { coachingType: string }> {
    if (USE_MOCK_API) {
      await this.delay(1200);
      return {
        message: "I see you're working on building consistency. Remember, every expert was once a beginner. Your commitment to showing up daily is what will make the difference.",
        tone: 'supportive',
        quote: "The secret of getting ahead is getting started. - Mark Twain",
        tips: [
          'Start with the smallest possible version of your habit',
          'Focus on the identity you want to build, not just the outcome',
          'Use implementation intentions: "When X happens, I will do Y"'
        ],
        challenge: challenge || 'Complete your most important habit first thing tomorrow morning',
        affirmation: 'I am someone who follows through on commitments to myself.',
        coachingType: 'personalized'
      };
    }

    try {
      const response = await this.api.post('/ai/coaching', { challenge, context });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get personalized coaching');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getHabitOptimization(habitId: string): Promise<{
    patterns: PatternAnalysis | null;
    insights: AIInsights | null;
    recommendations: HabitRecommendation[];
  }> {
    if (USE_MOCK_API) {
      await this.delay(2500);
      return {
        patterns: await this.analyzeHabitPatterns(habitId),
        insights: null, // Would be filtered insights specific to this habit
        recommendations: [
          {
            type: 'optimize',
            title: 'Optimize Timing',
            description: 'Based on your patterns, moving this habit 30 minutes earlier could improve consistency by 25%.',
            expectedImpact: 'high',
            difficulty: 'easy'
          },
          {
            type: 'modify',
            title: 'Reduce Friction',
            description: 'Prepare materials the night before to eliminate decision fatigue in the morning.',
            expectedImpact: 'medium',
            difficulty: 'easy'
          }
        ]
      };
    }

    try {
      const response = await this.api.get(`/ai/optimize/${habitId}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get habit optimization');
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const aiService = new AIService();