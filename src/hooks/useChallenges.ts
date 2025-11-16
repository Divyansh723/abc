import { useState, useEffect, useCallback } from 'react';
import challengeService, { 
  PersonalChallenge, 
  ChallengeParticipation, 
  ChallengeHistory 
} from '@/services/challengeService';
import { useAuth } from './useAuth';

interface UseChallengesReturn {
  // Available challenges
  challenges: PersonalChallenge[];
  challengesLoading: boolean;
  challengesError: string | null;
  
  // Active participations
  activeParticipations: ChallengeParticipation[];
  participationsLoading: boolean;
  participationsError: string | null;
  
  // Challenge history
  history: ChallengeHistory[];
  historyLoading: boolean;
  historyError: string | null;
  
  // Join challenge error
  joinError: string | null;
  clearJoinError: () => void;
  
  // Actions
  fetchChallenges: () => Promise<void>;
  fetchActiveParticipations: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<boolean>;
  abandonChallenge: (participationId: string) => Promise<boolean>;
  getChallengeDetails: (challengeId: string) => Promise<PersonalChallenge | null>;
  
  // Computed values
  activeChallengeCount: number;
  totalCompletedChallenges: number;
  totalXpFromChallenges: number;
}

export const useChallenges = (): UseChallengesReturn => {
  const { user } = useAuth();
  
  // Available challenges state
  const [challenges, setChallenges] = useState<PersonalChallenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [challengesError, setChallengesError] = useState<string | null>(null);
  
  // Active participations state
  const [activeParticipations, setActiveParticipations] = useState<ChallengeParticipation[]>([]);
  const [participationsLoading, setParticipationsLoading] = useState(false);
  const [participationsError, setParticipationsError] = useState<string | null>(null);
  
  // History state
  const [history, setHistory] = useState<ChallengeHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  // Join error state
  const [joinError, setJoinError] = useState<string | null>(null);

  // Fetch available challenges
  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    
    setChallengesLoading(true);
    setChallengesError(null);
    
    try {
      const data = await challengeService.getAllChallenges();
      setChallenges(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch challenges';
      setChallengesError(message);
      console.error('Error fetching challenges:', error);
    } finally {
      setChallengesLoading(false);
    }
  }, [user]);

  // Fetch active participations
  const fetchActiveParticipations = useCallback(async () => {
    if (!user) return;
    
    setParticipationsLoading(true);
    setParticipationsError(null);
    
    try {
      const data = await challengeService.getActiveParticipations();
      setActiveParticipations(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch active participations';
      setParticipationsError(message);
      console.error('Error fetching active participations:', error);
    } finally {
      setParticipationsLoading(false);
    }
  }, [user]);

  // Fetch challenge history
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    setHistoryLoading(true);
    setHistoryError(null);
    
    try {
      const data = await challengeService.getChallengeHistory();
      setHistory(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch challenge history';
      setHistoryError(message);
      console.error('Error fetching challenge history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  // Clear join error
  const clearJoinError = useCallback(() => {
    setJoinError(null);
  }, []);

  // Join a challenge
  const joinChallenge = useCallback(async (challengeId: string): Promise<boolean> => {
    if (!user) {
      setJoinError('Please log in to join challenges');
      return false;
    }
    
    // Clear previous error
    setJoinError(null);
    
    try {
      await challengeService.joinChallenge(challengeId);
      
      // Refresh data
      await Promise.all([
        fetchChallenges(),
        fetchActiveParticipations()
      ]);
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join challenge';
      console.error('Error joining challenge:', message);
      
      // Set error to display in UI
      setJoinError(message);
      return false;
    }
  }, [user, fetchChallenges, fetchActiveParticipations]);

  // Abandon a challenge
  const abandonChallenge = useCallback(async (participationId: string): Promise<boolean> => {
    if (!user) {
      console.error('Please log in to abandon challenges');
      return false;
    }
    
    try {
      await challengeService.abandonParticipation(participationId);
      
      // Refresh data
      await Promise.all([
        fetchChallenges(),
        fetchActiveParticipations(),
        fetchHistory()
      ]);
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to abandon challenge';
      console.error('Error abandoning challenge:', message);
      return false;
    }
  }, [user, fetchChallenges, fetchActiveParticipations, fetchHistory]);

  // Get challenge details
  const getChallengeDetails = useCallback(async (challengeId: string): Promise<PersonalChallenge | null> => {
    try {
      return await challengeService.getChallengeById(challengeId);
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      return null;
    }
  }, []);

  // Computed values
  const activeChallengeCount = activeParticipations.length;
  const totalCompletedChallenges = history.reduce((sum, h) => sum + h.completedCount, 0);
  const totalXpFromChallenges = history.reduce((sum, h) => sum + h.totalXpEarned, 0);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchChallenges();
      fetchActiveParticipations();
      fetchHistory();
    }
  }, [user, fetchChallenges, fetchActiveParticipations, fetchHistory]);

  return {
    // Available challenges
    challenges,
    challengesLoading,
    challengesError,
    
    // Active participations
    activeParticipations,
    participationsLoading,
    participationsError,
    
    // Challenge history
    history,
    historyLoading,
    historyError,
    
    // Join error
    joinError,
    clearJoinError,
    
    // Actions
    fetchChallenges,
    fetchActiveParticipations,
    fetchHistory,
    joinChallenge,
    abandonChallenge,
    getChallengeDetails,
    
    // Computed values
    activeChallengeCount,
    totalCompletedChallenges,
    totalXpFromChallenges,
  };
};

export default useChallenges;
