export interface CircleMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  optOutOfLeaderboard: boolean;
  communityPoints: number;
  name?: string; // Populated from User
}

export interface CircleEvent {
  _id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  createdAt: Date;
}

export interface ChallengeParticipant {
  userId: string;
  habitId?: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  joinedAt?: Date;
}

export interface HabitTemplate {
  name: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customFrequency?: {
    daysOfWeek?: number[];
    timesPerWeek?: number;
  };
  reminderTime?: string;
  icon?: string;
}

export interface CircleChallenge {
  _id: string;
  title: string;
  description?: string;
  type: 'streak' | 'completion' | 'consistency';
  target: number;
  pointsReward: number;
  startDate: Date;
  endDate: Date;
  habitTemplate?: HabitTemplate;
  participants: ChallengeParticipant[];
  createdBy: string;
  createdAt: Date;
}

export interface CircleAnnouncement {
  _id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdBy: string | { _id: string; name: string }; // Can be populated
  createdAt: Date;
}

export interface CircleMessage {
  _id: string;
  userId: string | { _id: string; name: string }; // Can be populated
  content: string;
  createdAt: Date;
  reported: boolean;
  reportedBy: string[];
  name?: string; // Fallback for populated name
}

export interface ModerationSettings {
  maxMessagesPerDay: number;
  profanityFilterEnabled: boolean;
  requireApproval: boolean;
}

export interface CommunityCircle {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: CircleMember[];
  maxMembers: number;
  isPrivate: boolean;
  inviteCode?: string;
  moderationSettings: ModerationSettings;
  messages: CircleMessage[];
  events: CircleEvent[];
  challenges: CircleChallenge[];
  announcements: CircleAnnouncement[];
  leaderboardUpdateDay: string;
  lastLeaderboardUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  memberCount: number;
  availableSpots: number;
  userIsMember?: boolean;
  userIsAdmin?: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  weeklyStreakAverage: number;
  habitCount: number;
  communityPoints: number;
}

export interface CircleLeaderboard {
  circleId: string;
  circleName: string;
  leaderboard: LeaderboardEntry[];
  lastUpdated: Date;
}
