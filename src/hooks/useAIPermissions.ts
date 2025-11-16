import { useAuth } from './useAuth';

export interface AIPermissions {
  isAIEnabled: boolean;
  isCommunityEnabled: boolean;
  canUseAIInsights: boolean;
  canUseAISuggestions: boolean;
  canUseAICoaching: boolean;
  canUsePatternAnalysis: boolean;
  canUseMoodCorrelation: boolean;
  canJoinCommunity: boolean;
  canShowOnLeaderboard: boolean;
}

export const useAIPermissions = (): AIPermissions => {
  const { user } = useAuth();

  const isAIEnabled = user?.privacySettings?.allowAIPersonalization !== false;
  const isCommunityEnabled = user?.privacySettings?.shareWithCommunity !== false;
  const canShowOnLeaderboard = user?.privacySettings?.showOnLeaderboard !== false;

  return {
    isAIEnabled,
    isCommunityEnabled,
    canUseAIInsights: isAIEnabled,
    canUseAISuggestions: isAIEnabled,
    canUseAICoaching: isAIEnabled,
    canUsePatternAnalysis: isAIEnabled,
    canUseMoodCorrelation: isAIEnabled,
    canJoinCommunity: isCommunityEnabled,
    canShowOnLeaderboard: canShowOnLeaderboard && isCommunityEnabled,
  };
};
