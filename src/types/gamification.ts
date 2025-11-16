import { Habit } from './habit';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  duration: number;
  rewardXP: number;
  badgeIcon: string;
  requirements: ChallengeRequirement[];
  active: boolean;
  participants: ChallengeParticipation[];
}

export interface ChallengeRequirement {
  type: 'completion_count' | 'streak_length' | 'consistency_rate';
  value: number;
  habitCategories?: string[];
}

export interface ChallengeParticipation {
  id: string;
  userId: string;
  challengeId: string;
  startDate: Date;
  endDate: Date;
  completed: boolean;
  progress: number;
  habitSnapshotAtJoin: Habit[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  source: 'habit_completion' | 'challenge_completion' | 'streak_milestone' | 'level_bonus';
  sourceId: string;
  createdAt: Date;
}