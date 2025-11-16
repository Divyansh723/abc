import { useState, useEffect, useCallback } from 'react';
import communityService from '@/services/communityService';
import { CommunityCircle, CircleLeaderboard } from '@/types/community';

export const useCommunity = () => {
  const [circles, setCircles] = useState<CommunityCircle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCircles = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { circles: fetchedCircles } = await communityService.getCircles({ search });
      setCircles(fetchedCircles);
      console.log('Fetched circles:', fetchedCircles);
    } catch (err) {
      console.error('Error fetching circles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch circles');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCircle = useCallback(async (data: {
    name: string;
    description?: string;
    maxMembers?: number;
    isPrivate?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await communityService.createCircle(data);
      await fetchCircles();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create circle';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCircles]);

  const joinCircle = useCallback(async (circleId: string, inviteCode?: string) => {
    setLoading(true);
    setError(null);
    try {
      await communityService.joinCircle(circleId, inviteCode);
      await fetchCircles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join circle';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCircles]);

  const leaveCircle = useCallback(async (circleId: string) => {
    setLoading(true);
    setError(null);
    try {
      await communityService.leaveCircle(circleId);
      await fetchCircles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave circle';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCircles]);

  const deleteCircle = useCallback(async (circleId: string) => {
    setLoading(true);
    setError(null);
    try {
      await communityService.deleteCircle(circleId);
      await fetchCircles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete circle';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCircles]);

  return {
    circles,
    loading,
    error,
    fetchCircles,
    createCircle,
    joinCircle,
    leaveCircle,
    deleteCircle
  };
};

export const useCircleDetails = (circleId: string | null) => {
  const [circle, setCircle] = useState<CommunityCircle | null>(null);
  const [leaderboard, setLeaderboard] = useState<CircleLeaderboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCircle = useCallback(async () => {
    if (!circleId || circleId.trim() === '') {
      console.log('useCircleDetails: No circleId provided or empty string');
      return;
    }
    
    console.log('useCircleDetails: Fetching circle with ID:', circleId);
    setLoading(true);
    setError(null);
    try {
      const fetchedCircle = await communityService.getCircleById(circleId);
      console.log('useCircleDetails: Fetched circle:', fetchedCircle);
      setCircle(fetchedCircle);
    } catch (err) {
      console.error('useCircleDetails: Error fetching circle:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch circle');
    } finally {
      setLoading(false);
    }
  }, [circleId]);

  const fetchLeaderboard = useCallback(async () => {
    if (!circleId) return;
    
    try {
      const fetchedLeaderboard = await communityService.getLeaderboard(circleId);
      setLeaderboard(fetchedLeaderboard);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, [circleId]);

  const postMessage = useCallback(async (content: string) => {
    if (!circleId) return;
    
    setError(null);
    try {
      await communityService.postMessage(circleId, content);
      await fetchCircle(); // Refresh to get new message
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to post message';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [circleId, fetchCircle]);

  const toggleLeaderboardOptOut = useCallback(async () => {
    if (!circleId) return;
    
    try {
      await communityService.toggleLeaderboardOptOut(circleId);
      await fetchCircle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [circleId, fetchCircle]);

  const reportMessage = useCallback(async (messageId: string) => {
    if (!circleId) return;
    
    try {
      await communityService.reportMessage(circleId, messageId);
      await fetchCircle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to report message';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [circleId, fetchCircle]);

  useEffect(() => {
    fetchCircle();
  }, [fetchCircle]);

  // Only fetch leaderboard if user is a member
  useEffect(() => {
    if (circle?.userIsMember) {
      fetchLeaderboard();
    }
  }, [circle?.userIsMember, fetchLeaderboard]);

  return {
    circle,
    leaderboard,
    loading,
    error,
    postMessage,
    toggleLeaderboardOptOut,
    reportMessage,
    refreshCircle: fetchCircle,
    refreshLeaderboard: fetchLeaderboard
  };
};
