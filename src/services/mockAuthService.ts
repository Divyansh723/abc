import { type User } from '@/types/user';
import { type UserLoginData, type UserRegistrationData } from '@/utils/validationUtils';

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@habitforge.com',
    name: 'Demo User',
    timezone: 'America/New_York',
    level: 5,
    totalXP: 450,
    forgivenessTokens: 2,
    aiOptOut: false,
    theme: 'light',
    notificationPreferences: {
      push: true,
      email: true,
      inApp: true,
      reminderTime: '09:00',
    },
    privacySettings: {
      shareWithCommunity: true,
      allowAIPersonalization: true,
      showOnLeaderboard: true,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    softDeleted: false,
  },
];

// Mock authentication responses
export interface MockAuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class MockAuthService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async login(credentials: UserLoginData): Promise<MockAuthResponse> {
    await this.delay(1000); // Simulate network delay

    // Check for demo credentials
    if (credentials.email === 'demo@habitforge.com' && credentials.password === 'password') {
      const user = mockUsers[0];
      return {
        user,
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      };
    }

    // Simulate login failure
    throw new Error('Invalid email or password');
  }

  async register(userData: UserRegistrationData): Promise<MockAuthResponse> {
    await this.delay(1500); // Simulate network delay

    // Check if email already exists
    if (mockUsers.some(user => user.email === userData.email)) {
      throw new Error('An account with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      level: 1,
      totalXP: 0,
      forgivenessTokens: 2,
      aiOptOut: false,
      theme: 'light',
      notificationPreferences: {
        push: true,
        email: true,
        inApp: true,
      },
      privacySettings: {
        shareWithCommunity: true,
        allowAIPersonalization: true,
        showOnLeaderboard: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      softDeleted: false,
    };

    mockUsers.push(newUser);

    return {
      user: newUser,
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
  }

  async logout(): Promise<void> {
    await this.delay(500);
    // In a real implementation, this would invalidate the token on the server
  }

  async refreshToken(_refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    await this.delay(500);
    
    return {
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
  }

  async getCurrentUser(_token: string): Promise<User> {
    await this.delay(300);
    
    // In a real implementation, this would decode the JWT and fetch user data
    return mockUsers[0]; // Return demo user for now
  }
}

export const mockAuthService = new MockAuthService();