import { useCallback, useEffect, useState } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAuthStore } from '@/stores/authStore';
import { calculateLevelInfo, type LevelUpResult } from '@/utils/xpUtils';
import { gamificationService } from '@/services/gamificationService';
import { eventBus, EVENTS } from '@/utils/eventBus';

// Fallback achievements for when API is not available
const fallbackAchievements = [
  {
    id: 'first-habit',
    name: 'First Steps',
    description: 'Complete your first habit and start your journey',
    icon: '🎯',
    rarity: 'common' as const,
    category: 'milestone' as const,
    requirement: 'Complete 1 habit',
    progress: 0,
    maxProgress: 1,
    unlockedAt: undefined,
    xpReward: 10,
    workNeeded: 'Complete any habit once to unlock this achievement'
  },
  {
    id: 'habit-creator',
    name: 'Habit Creator',
    description: 'Create your first 3 habits',
    icon: '🏗️',
    rarity: 'common' as const,
    category: 'milestone' as const,
    requirement: 'Create 3 habits',
    progress: 0,
    maxProgress: 3,
    unlockedAt: undefined,
    xpReward: 15,
    workNeeded: 'Go to Goals page and create 3 different habits'
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach level 5 through consistent habit building',
    icon: '⭐',
    rarity: 'rare' as const,
    category: 'milestone' as const,
    requirement: 'Reach level 5',
    progress: 0,
    maxProgress: 5,
    unlockedAt: undefined,
    xpReward: 50,
    workNeeded: 'Earn more XP by completing habits and challenges'
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak with any habit',
    icon: '🔥',
    rarity: 'rare' as const,
    category: 'streak' as const,
    requirement: 'Maintain 7-day streak',
    progress: 0,
    maxProgress: 7,
    unlockedAt: undefined,
    xpReward: 25,
    workNeeded: 'Complete the same habit for 7 consecutive days without missing'
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Achieve a 30-day streak - true dedication!',
    icon: '🚀',
    rarity: 'epic' as const,
    category: 'streak' as const,
    requirement: 'Maintain 30-day streak',
    progress: 0,
    maxProgress: 30,
    unlockedAt: undefined,
    xpReward: 75,
    workNeeded: 'Complete the same habit for 30 consecutive days'
  },
  {
    id: 'habit-completionist',
    name: 'Habit Completionist',
    description: 'Complete 100 total habit instances',
    icon: '✅',
    rarity: 'rare' as const,
    category: 'completion' as const,
    requirement: 'Complete 100 habits',
    progress: 0,
    maxProgress: 100,
    unlockedAt: undefined,
    xpReward: 40,
    workNeeded: 'Complete habits 100 times total (across all your habits)'
  },
  {
    id: 'challenge-accepted',
    name: 'Challenge Accepted',
    description: 'Complete your first challenge',
    icon: '🎯',
    rarity: 'common' as const,
    category: 'challenge' as const,
    requirement: 'Complete 1 challenge',
    progress: 0,
    maxProgress: 1,
    unlockedAt: undefined,
    xpReward: 30,
    workNeeded: 'Join and complete any challenge from the Challenges tab'
  }
];

export const useGamification = () => {
  const {
    totalXP,
    currentLevel,
    forgivenessTokens,
    pendingLevelUp,
    recentXPGains,
    gamificationData,
    isLoading,
    addXP,
    addHabitCompletionXP,
    clearPendingLevelUp,
    setTotalXP,
    clearRecentXPGains,
    fetchGamificationData,
    syncXPWithServer,
    useForgivenessToken
  } = useGamificationStore();

  const { updateUser } = useAuthStore();

  // Fetch gamification data on mount
  useEffect(() => {
    fetchGamificationData();
  }, []); // Empty dependency array to run only on mount

  // Sync XP with user profile
  const syncXPWithProfile = useCallback((xp: number) => {
    const levelInfo = calculateLevelInfo(xp);
    updateUser({
      totalXP: xp,
      level: levelInfo.currentLevel,
    });
  }, [updateUser]);

  // Award XP for habit completion
  const awardHabitCompletionXP = useCallback((
    streakLength: number = 0,
    isFirstCompletion: boolean = false,
    isPerfectWeek: boolean = false
  ): LevelUpResult | null => {
    const levelUpResult = addHabitCompletionXP(streakLength, isFirstCompletion, isPerfectWeek);
    
    // Sync with user profile
    const newXP = totalXP + (recentXPGains[0]?.totalXP || 0);
    syncXPWithProfile(newXP);
    
    return levelUpResult;
  }, [addHabitCompletionXP, totalXP, recentXPGains, syncXPWithProfile]);

  // Award custom XP
  const awardXP = useCallback((amount: number, source: string = 'Custom reward'): LevelUpResult | null => {
    const levelUpResult = addXP(amount, source);
    
    // Sync with user profile
    syncXPWithProfile(totalXP + amount);
    
    return levelUpResult;
  }, [addXP, totalXP, syncXPWithProfile]);

  // Award challenge completion XP
  const awardChallengeXP = useCallback((challengeType: 'recovery' | 'weekly' | 'monthly' | 'custom', customAmount?: number): LevelUpResult | null => {
    const xpAmounts = {
      recovery: 15,
      weekly: 50,
      monthly: 200,
      custom: customAmount || 25,
    };

    const amount = xpAmounts[challengeType];
    const source = `${challengeType.charAt(0).toUpperCase() + challengeType.slice(1)} challenge completion`;
    
    return awardXP(amount, source);
  }, [awardXP]);

  // Award streak milestone XP
  const awardStreakMilestoneXP = useCallback((streakLength: number): LevelUpResult | null => {
    let amount = 0;
    let source = '';

    if (streakLength === 7) {
      amount = 25;
      source = '7-day streak milestone';
    } else if (streakLength === 14) {
      amount = 50;
      source = '14-day streak milestone';
    } else if (streakLength === 30) {
      amount = 100;
      source = '30-day streak milestone';
    } else if (streakLength === 100) {
      amount = 250;
      source = '100-day streak milestone';
    } else if (streakLength % 50 === 0) {
      amount = 150;
      source = `${streakLength}-day streak milestone`;
    }

    if (amount > 0) {
      return awardXP(amount, source);
    }

    return null;
  }, [awardXP]);

  // Initialize XP from user profile
  const initializeFromProfile = useCallback((userXP: number) => {
    setTotalXP(userXP);
  }, [setTotalXP]);

  // Get level info
  const getLevelInfo = useCallback(() => {
    return calculateLevelInfo(totalXP);
  }, [totalXP]);

  // Handle level up completion
  const handleLevelUpComplete = useCallback(() => {
    clearPendingLevelUp();
  }, [clearPendingLevelUp]);

  // Get recent XP activity
  const getRecentActivity = useCallback(() => {
    return recentXPGains.slice(0, 5); // Return last 5 XP gains
  }, [recentXPGains]);

  // Clear activity history
  const clearActivity = useCallback(() => {
    clearRecentXPGains();
  }, [clearRecentXPGains]);

  // Challenge state
  const [challenges, setChallenges] = useState<any[]>([]);
  const [challengeParticipations, setChallengeParticipations] = useState<any[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);

  // Achievement state
  const [achievements, setAchievements] = useState<any[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  // Fetch challenges and participations
  const fetchChallenges = useCallback(async () => {
    try {
      setChallengesLoading(true);
      const [challengesData, participationsData] = await Promise.all([
        gamificationService.getChallenges(),
        gamificationService.getChallengeParticipations()
      ]);
      setChallenges(challengesData);
      setChallengeParticipations(participationsData);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setChallengesLoading(false);
    }
  }, []);

  // Join a challenge
  const joinChallenge = useCallback(async (challengeId: string) => {
    try {
      setChallengesLoading(true);
      const result = await gamificationService.joinChallenge(challengeId);
      
      // Update local state
      setChallengeParticipations(prev => [...prev, result.participation]);
      
      // Refresh gamification data
      await fetchGamificationData();
      
      return result;
    } catch (error) {
      console.error('Failed to join challenge:', error);
      throw error;
    } finally {
      setChallengesLoading(false);
    }
  }, [fetchGamificationData]);

  // Leave a challenge
  const leaveChallenge = useCallback(async (challengeId: string) => {
    try {
      setChallengesLoading(true);
      const result = await gamificationService.leaveChallenge(challengeId);
      
      // Update local state
      setChallengeParticipations(prev => 
        prev.filter(p => p.challengeId !== challengeId || p.completed)
      );
      
      return result;
    } catch (error) {
      console.error('Failed to leave challenge:', error);
      throw error;
    } finally {
      setChallengesLoading(false);
    }
  }, []);

  // Update challenge progress
  const updateChallengeProgress = useCallback(async (challengeId: string, progress: number) => {
    try {
      const result = await gamificationService.updateChallengeProgress(challengeId, progress);
      
      // Update local state
      setChallengeParticipations(prev => 
        prev.map(p => 
          p.challengeId === challengeId 
            ? { ...p, progress: result.participation.progress, completed: result.participation.completed }
            : p
        )
      );
      
      // If challenge completed, refresh gamification data for XP update
      if (result.completed) {
        await fetchGamificationData();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
      throw error;
    }
  }, [fetchGamificationData]);

  // Fetch achievements
  const fetchAchievements = useCallback(async () => {
    try {
      setAchievementsLoading(true);
      const achievementsData = await gamificationService.getAchievements();
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      // Set fallback achievements if API fails

      setAchievements(fallbackAchievements);
    } finally {
      setAchievementsLoading(false);
    }
  }, []);

  // Fetch challenges on mount
  useEffect(() => {
    fetchChallenges();
    fetchAchievements();
  }, [fetchChallenges, fetchAchievements]);

  // Listen for events and auto-refresh
  useEffect(() => {
    const handleRefresh = () => {
      fetchGamificationData();
      fetchAchievements();
    };

    const handleChallengeEvent = () => {
      fetchChallenges();
    };

    // Subscribe to events
    eventBus.on(EVENTS.HABIT_COMPLETED, handleRefresh);
    eventBus.on(EVENTS.XP_GAINED, handleRefresh);
    eventBus.on(EVENTS.LEVEL_UP, handleRefresh);
    eventBus.on(EVENTS.FORGIVENESS_USED, handleRefresh);
    eventBus.on(EVENTS.CHALLENGE_JOINED, handleChallengeEvent);
    eventBus.on(EVENTS.CHALLENGE_COMPLETED, handleChallengeEvent);

    // Cleanup
    return () => {
      eventBus.off(EVENTS.HABIT_COMPLETED, handleRefresh);
      eventBus.off(EVENTS.XP_GAINED, handleRefresh);
      eventBus.off(EVENTS.LEVEL_UP, handleRefresh);
      eventBus.off(EVENTS.FORGIVENESS_USED, handleRefresh);
      eventBus.off(EVENTS.CHALLENGE_JOINED, handleChallengeEvent);
      eventBus.off(EVENTS.CHALLENGE_COMPLETED, handleChallengeEvent);
    };
  }, [fetchGamificationData, fetchAchievements, fetchChallenges]);



  return {
    // State
    totalXP,
    currentLevel,
    forgivenessTokens,
    pendingLevelUp,
    recentXPGains,
    gamificationData,
    isLoading,
    achievements: achievements.length > 0 ? achievements : fallbackAchievements,
    achievementsLoading,
    challenges,
    challengeParticipations,
    challengesLoading,
    
    // Actions
    awardHabitCompletionXP,
    awardXP,
    awardChallengeXP,
    awardStreakMilestoneXP,
    handleLevelUpComplete,
    initializeFromProfile,
    syncXPWithServer,
    useForgivenessToken,
    fetchGamificationData,
    fetchChallenges,
    fetchAchievements,
    joinChallenge,
    leaveChallenge,
    updateChallengeProgress,
    
    // Computed
    getLevelInfo,
    getRecentActivity,
    clearActivity,
  };
};