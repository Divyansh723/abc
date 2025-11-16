import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { gamificationService } from '@/services/gamificationService';

interface ForgivenessTokenState {
  tokens: number;
  maxTokens: number;
  isLoading: boolean;
  error: string | null;
}

export const useForgivenessTokens = () => {
  const { user } = useAuth();
  const [state, setState] = useState<ForgivenessTokenState>({
    tokens: 0,
    maxTokens: 3,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (user) {
      setState(prev => ({
        ...prev,
        tokens: user.forgivenessTokens || 0,
      }));
    }
  }, [user]);

  const useToken = async (habitId: string, date: Date, timezone?: string) => {
    if (state.tokens <= 0) {
      throw new Error('No forgiveness tokens available');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await gamificationService.useForgivenessToken({
        habitId,
        date: date.toISOString(),
        timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      setState(prev => ({
        ...prev,
        tokens: result.remainingTokens,
        isLoading: false,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to use token';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  };

  const canUseToken = () => {
    return state.tokens > 0 && !state.isLoading;
  };

  return {
    tokens: state.tokens,
    maxTokens: state.maxTokens,
    isLoading: state.isLoading,
    error: state.error,
    useToken,
    canUseToken,
  };
};
