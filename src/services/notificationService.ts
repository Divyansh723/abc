import axios from 'axios';
import { Notification, NotificationsResponse, NotificationFilters } from '../types/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  try {
    const authData = localStorage.getItem('habitforge-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      const token = parsed.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }
  return config;
});

class NotificationService {
  // Get notifications with pagination and filtering
  async getNotifications(filters: NotificationFilters): Promise<NotificationsResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      if (filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.read !== undefined) {
        params.append('read', filters.read.toString());
      }

      console.log('NotificationService: Making API call to /notifications with params:', params.toString());
      const response = await api.get(`/notifications?${params.toString()}`);
      console.log('NotificationService: API response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('NotificationService: Error fetching notifications:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      throw new Error('Failed to fetch notifications');
    }
  }

  // Get recent notifications for dropdown
  async getRecentNotifications(limit: number = 5): Promise<{ notifications: Notification[]; unreadCount: number }> {
    try {
      const response = await api.get(`/notifications/recent?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      throw new Error('Failed to fetch recent notifications');
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw new Error('Failed to fetch unread count');
    }
  }

  // Mark notifications as read
  async markAsRead(notificationIds: string[]): Promise<{ unreadCount: number }> {
    try {
      console.log('NotificationService.markAsRead: Sending request with IDs:', notificationIds);
      const response = await api.patch('/notifications/mark-read', { notificationIds });
      console.log('NotificationService.markAsRead: Response:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('NotificationService.markAsRead: Error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        console.error('Response data:', axiosError.response?.data);
        console.error('Response status:', axiosError.response?.status);
      }
      throw new Error('Failed to mark notifications as read');
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ unreadCount: number }> {
    try {
      const response = await api.patch('/notifications/mark-all-read');
      return response.data.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ unreadCount: number }> {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  // Delete all read notifications
  async deleteAllRead(): Promise<{ deletedCount: number; unreadCount: number }> {
    try {
      const response = await api.delete('/notifications/read/all');
      return response.data.data;
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw new Error('Failed to delete read notifications');
    }
  }
}

export default new NotificationService();
