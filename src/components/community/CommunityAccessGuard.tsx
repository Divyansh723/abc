import React from 'react';
import { useCommunityAccess } from '@/hooks/useCommunityAccess';
import { CommunityDisabledMessage } from './CommunityDisabledMessage';

interface CommunityAccessGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component that checks if user has community access
 * Shows disabled message if community features are turned off
 */
export const CommunityAccessGuard: React.FC<CommunityAccessGuardProps> = ({ children }) => {
  const { canAccessCommunity } = useCommunityAccess();

  if (!canAccessCommunity) {
    return <CommunityDisabledMessage />;
  }

  return <>{children}</>;
};
