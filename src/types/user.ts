export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  timezone: string;
  level: number;
  totalXP: number;
  forgivenessTokens: number;
  aiOptOut: boolean;
  theme: 'light' | 'dark' | 'system';
  accentColor?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'red' | 'teal' | 'indigo';
  notificationPreferences: NotificationPreferences;
  privacySettings: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
  softDeleted: boolean;
  deletionRequestedAt?: Date;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  inApp: boolean;
  reminderTime?: string;
  habitReminders?: boolean;
  streakMilestones?: boolean;
  dailySummary?: boolean;
  weeklyInsights?: boolean;
  challengeUpdates?: boolean;
  communityActivity?: boolean;
  systemUpdates?: boolean;
  tipsAndTricks?: boolean;
  autoForgiveness?: boolean;
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
  soundEnabled?: boolean;
}

export interface PrivacySettings {
  shareWithCommunity: boolean;
  allowAIPersonalization: boolean;
  showOnLeaderboard: boolean;
  profileVisibility?: 'public' | 'friends' | 'private';
  habitDataSharing?: boolean;
  analyticsSharing?: boolean;
  thirdPartySharing?: boolean;
  marketingEmails?: boolean;
  dataRetention?: '6months' | '1year' | '2years' | 'indefinite';
}