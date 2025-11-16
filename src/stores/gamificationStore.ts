import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  calculateLevelInfo, 
  processLevelUp, 
  calculateHabitCompletionXP,
  type LevelUpResult,
  type XPCalculation 
} from '@/utils/xpUtils';
import { gamificationService, type GamificationData } from '@/services/gamificationService';

interface GamificationState {
  totalXP: number;
  currentLevel: number;
  forgivenessTokens: number;
  pendingLevelUp: LevelUpResult | null;
  recentXPGains: XPCalculation[];
  gamificationData: GamificationData | null;
  isLoading: boolean;
  
  // Actions
  addXP: (xp: number, source?: string) => LevelUpResult | null;
  addHabitCompletionXP: (streakLength?: number, isFirstCompletion?: boolean, isPerfectWeek?: boolean) => LevelUpResult | null;
  addChallengeCompletionXP: (xp: number, challengeTitle: string) => LevelUpResult | null;
  clearPendingLevelUp: () => void;
  setTotalXP: (xp: number) => void;
  clearRecentXPGains: () => void;
  fetchGamificationData: () => Promise<void>;
  syncXPWithServer: (amount: number, source: string, description: string, habitId?: string, metadata?: any) => Promise<void>;
  useForgivenessToken: (habitId: string, date: string, timezone?: string) => Promise<void>;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      currentLevel: 1,
      forgivenessTokens: 3,
      pendingLevelUp: null,
      recentXPGains: [],
      gamificationData: null,
      isLoading: false,

      addXP: (xp: number, source: string = 'Unknown') => {
        const { totalXP } = get();
        const newTotalXP = totalXP + xp;
        const levelUpResult = processLevelUp(totalXP, newTotalXP);
        
        const xpGain: XPCalculation = {
          baseXP: xp,
          streakBonus: 0,
          multiplierBonus: 0,
          totalXP: xp,
          reason: source,
        };

        set(state => ({
          totalXP: newTotalXP,
          currentLevel: calculateLevelInfo(newTotalXP).currentLevel,
          pendingLevelUp: levelUpResult,
          recentXPGains: [xpGain, ...state.recentXPGains.slice(0, 9)], // Keep last 10
        }));

        return levelUpResult;
      },

      addHabitCompletionXP: (
        streakLength: number = 0, 
        isFirstCompletion: boolean = false, 
        isPerfectWeek: boolean = false
      ) => {
        const { totalXP } = get();
        const multiplier = isFirstCompletion ? 1.5 : (isPerfectWeek ? 1.2 : 1);
        const xpCalculation = calculateHabitCompletionXP(
          10, // base XP
          streakLength,
          multiplier,
          'Habit completion'
        );
        
        const newTotalXP = totalXP + xpCalculation.totalXP;
        const levelUpResult = processLevelUp(totalXP, newTotalXP);

        set(state => ({
          totalXP: newTotalXP,
          currentLevel: calculateLevelInfo(newTotalXP).currentLevel,
          pendingLevelUp: levelUpResult,
          recentXPGains: [xpCalculation, ...state.recentXPGains.slice(0, 9)], // Keep last 10
        }));

        return levelUpResult;
      },

      addChallengeCompletionXP: (xp: number, challengeTitle: string) => {
        const { totalXP } = get();
        const newTotalXP = totalXP + xp;
        const levelUpResult = processLevelUp(totalXP, newTotalXP);
        
        const xpGain: XPCalculation = {
          baseXP: xp,
          streakBonus: 0,
          multiplierBonus: 0,
          totalXP: xp,
          reason: `Challenge completed: ${challengeTitle}`,
        };

        set(state => ({
          totalXP: newTotalXP,
          currentLevel: calculateLevelInfo(newTotalXP).currentLevel,
          pendingLevelUp: levelUpResult,
          recentXPGains: [xpGain, ...state.recentXPGains.slice(0, 9)], // Keep last 10
        }));

        return levelUpResult;
      },

      clearPendingLevelUp: () => {
        set({ pendingLevelUp: null });
      },

      setTotalXP: (xp: number) => {
        set({
          totalXP: xp,
          currentLevel: calculateLevelInfo(xp).currentLevel,
        });
      },

      clearRecentXPGains: () => {
        set({ recentXPGains: [] });
      },

      fetchGamificationData: async () => {
        set({ isLoading: true });
        try {
          const data = await gamificationService.getGamificationData();
          set({ 
            gamificationData: data,
            totalXP: data.totalXP,
            currentLevel: data.currentLevel,
            forgivenessTokens: data.forgivenessTokens,
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to fetch gamification data:', error);
          set({ isLoading: false });
        }
      },

      syncXPWithServer: async (amount: number, source: string, description: string, habitId?: string, metadata?: any) => {
        try {
          const result = await gamificationService.addXP({
            amount,
            source,
            description,
            habitId,
            metadata
          });
          
          // Update local state with server response
          const levelUpResult: LevelUpResult | null = result.leveledUp ? {
            newLevel: result.newLevel,
            xpGained: result.transaction.amount + result.bonusXP,
            rewards: [`Level ${result.newLevel} reached!`]
          } : null;

          set(state => ({
            totalXP: result.newTotalXP,
            currentLevel: result.newLevel,
            pendingLevelUp: levelUpResult,
            recentXPGains: [
              {
                baseXP: result.transaction.amount,
                streakBonus: result.bonusXP,
                multiplierBonus: 0,
                totalXP: result.transaction.amount + result.bonusXP,
                reason: result.transaction.description,
              },
              ...state.recentXPGains.slice(0, 9)
            ]
          }));
        } catch (error) {
          console.error('Failed to sync XP with server:', error);
          throw error;
        }
      },

      useForgivenessToken: async (habitId: string, date: string, timezone?: string) => {
        try {
          const result = await gamificationService.useForgivenessToken({
            habitId,
            date,
            timezone
          });
          
          set(() => ({
            forgivenessTokens: result.remainingTokens
          }));
        } catch (error) {
          console.error('Failed to use forgiveness token:', error);
          throw error;
        }
      },
    }),
    {
      name: 'habitforge-gamification',
      partialize: (state) => ({
        totalXP: state.totalXP,
        currentLevel: state.currentLevel,
        forgivenessTokens: state.forgivenessTokens,
        recentXPGains: state.recentXPGains.slice(0, 5), // Persist only recent 5
      }),
    }
  )
);