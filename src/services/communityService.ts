import axios from 'axios';
import { CommunityCircle, CircleLeaderboard } from '@/types/community';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class CommunityService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/community`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add auth token to requests
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private getStoredToken(): string | null {
    try {
      const authData = localStorage.getItem('habitforge-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.warn('Failed to get stored token:', error);
    }
    return null;
  }

  // Create a new circle
  async createCircle(data: {
    name: string;
    description?: string;
    maxMembers?: number;
    isPrivate?: boolean;
  }): Promise<{ circle: CommunityCircle; inviteCode?: string }> {
    try {
      const response = await this.api.post('/', data);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create circle');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Get all circles
  async getCircles(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    circles: CommunityCircle[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const response = await this.api.get('/', { params });
      return {
        circles: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch circles');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Get single circle by ID
  async getCircleById(circleId: string): Promise<CommunityCircle> {
    try {
      const response = await this.api.get(`/${circleId}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch circle');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Join a circle
  async joinCircle(circleId: string, inviteCode?: string): Promise<void> {
    try {
      await this.api.post(`/${circleId}/join`, { inviteCode });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to join circle');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Leave a circle
  async leaveCircle(circleId: string): Promise<void> {
    try {
      await this.api.delete(`/${circleId}/leave`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to leave circle');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Post a message
  async postMessage(circleId: string, content: string): Promise<void> {
    try {
      await this.api.post(`/${circleId}/messages`, { content });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to post message');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Get circle leaderboard
  async getLeaderboard(circleId: string): Promise<CircleLeaderboard> {
    try {
      const response = await this.api.get(`/${circleId}/leaderboard`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Toggle leaderboard opt-out
  async toggleLeaderboardOptOut(circleId: string): Promise<{ optOutOfLeaderboard: boolean }> {
    try {
      const response = await this.api.put(`/${circleId}/leaderboard/opt-out`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update leaderboard settings');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Report a message
  async reportMessage(circleId: string, messageId: string): Promise<void> {
    try {
      await this.api.post(`/${circleId}/messages/${messageId}/report`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to report message');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Create announcement
  async createAnnouncement(circleId: string, announcement: {
    title: string;
    content: string;
    isImportant?: boolean;
  }): Promise<void> {
    try {
      await this.api.post(`/${circleId}/announcements`, announcement);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create announcement');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Get announcements
  async getAnnouncements(circleId: string): Promise<any> {
    try {
      const response = await this.api.get(`/${circleId}/announcements`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch announcements');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Update announcement
  async updateAnnouncement(circleId: string, announcementId: string, announcement: {
    title: string;
    content: string;
    isImportant?: boolean;
  }): Promise<void> {
    try {
      await this.api.put(`/${circleId}/announcements/${announcementId}`, announcement);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update announcement');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Delete announcement
  async deleteAnnouncement(circleId: string, announcementId: string): Promise<void> {
    try {
      await this.api.delete(`/${circleId}/announcements/${announcementId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete announcement');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Create challenge
  async createChallenge(circleId: string, challenge: {
    title: string;
    description?: string;
    type: 'streak' | 'completion' | 'consistency';
    target: number;
    pointsReward?: number;
    startDate: string;
    endDate: string;
  }): Promise<void> {
    try {
      await this.api.post(`/${circleId}/challenges`, challenge);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create challenge');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Update challenge
  async updateChallenge(circleId: string, challengeId: string, challenge: {
    title?: string;
    description?: string;
    type?: 'streak' | 'completion' | 'consistency';
    target?: number;
    pointsReward?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<void> {
    try {
      await this.api.put(`/${circleId}/challenges/${challengeId}`, challenge);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update challenge');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Delete challenge
  async deleteChallenge(circleId: string, challengeId: string): Promise<void> {
    try {
      await this.api.delete(`/${circleId}/challenges/${challengeId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete challenge');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Join challenge
  async joinChallenge(circleId: string, challengeId: string): Promise<void> {
    try {
      await this.api.post(`/${circleId}/challenges/${challengeId}/join`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to join challenge');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Update challenge progress (for challenges without habit templates)
  async updateChallengeProgress(circleId: string, challengeId: string, progress: number): Promise<void> {
    try {
      await this.api.put(`/${circleId}/challenges/${challengeId}/progress`, { progress });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update progress');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Remove member from circle (admin only)
  async removeMember(circleId: string, memberId: string, reason: string): Promise<void> {
    try {
      await this.api.delete(`/${circleId}/members/${memberId}`, {
        data: { reason }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to remove member');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Update circle (admin only)
  async updateCircle(circleId: string, data: { name?: string; description?: string }): Promise<void> {
    try {
      await this.api.put(`/${circleId}`, data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update circle');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Delete circle (admin only)
  async deleteCircle(circleId: string): Promise<void> {
    try {
      await this.api.delete(`/${circleId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete circle');
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const communityService = new CommunityService();
export default communityService;
