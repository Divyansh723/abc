import { useAuth } from './useAuth';

/**
 * Hook to check if user has access to community features
 * Based on privacy settings
 */
export const useCommunityAccess = () => {
  const { user } = useAuth();
  
  // Check if community features are enabled (default to true if not set)
  const canAccessCommunity = user?.privacySettings?.shareWithCommunity ?? true;
  
  // Check if user wants to show on leaderboards (default to true if not set)
  const showOnLeaderboard = user?.privacySettings?.showOnLeaderboard ?? true;
  
  return {
    canAccessCommunity,
    showOnLeaderboard,
    isRestricted: !canAccessCommunity,
    privacySettings: user?.privacySettings
  };
};
