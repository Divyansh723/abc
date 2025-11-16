import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { Notification, NotificationsResponse, NotificationFilters } from '../types/notification';
import { useNotificationStore } from '../stores/notificationStore';

interface UseNotificationsReturn {
  // Data
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: NotificationsResponse['pagination'] | null;
  
  // Actions
  fetchNotifications: (filters: NotificationFilters) => Promise<void>;
  fetchRecentNotifications: (limit?: number) => Promise<Notification[]>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<NotificationsResponse['pagination'] | null>(null);
  
  // Use global store for unread count so all components see the same value
  const { unreadCount, setUnreadCount } = useNotificationStore();

  // Fetch notifications with filters
  const fetchNotifications = useCallback(async (filters: NotificationFilters) => {
    console.log('useNotifications: Fetching notifications with filters:', filters);
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications(filters);
      console.log('useNotifications: Received response:', response);
      setNotifications(response.notifications);
      setPagination(response.pagination);
      setUnreadCount(response.unreadCount);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [setUnreadCount]);

  // Fetch recent notifications for dropdown
  const fetchRecentNotifications = useCallback(async (limit: number = 5): Promise<Notification[]> => {
    try {
      const response = await notificationService.getRecentNotifications(limit);
      setUnreadCount(response.unreadCount);
      return response.notifications;
    } catch (err) {
      console.error('Error fetching recent notifications:', err);
      return [];
    }
  }, [setUnreadCount]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    console.log('useNotifications.markAsRead: Called with IDs:', notificationIds);
    try {
      const response = await notificationService.markAsRead(notificationIds);
      console.log('useNotifications.markAsRead: Response:', response);
      setUnreadCount(response.unreadCount);
      
      // Update local state immediately for instant UI feedback
      setNotifications(prev => {
        const updated = prev.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        );
        console.log('useNotifications.markAsRead: Updated notifications:', updated);
        return updated;
      });
      console.log('useNotifications.markAsRead: Successfully marked as read');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark notifications as read';
      setError(message);
      console.error('useNotifications.markAsRead: Error:', err);
      // Revert the optimistic update on error
      throw err;
    }
  }, [setUnreadCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();
      setUnreadCount(response.unreadCount);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      setError(message);
      console.error('Error marking all notifications as read:', err);
    }
  }, [setUnreadCount]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      setUnreadCount(response.unreadCount);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(message);
      console.error('Error deleting notification:', err);
    }
  }, [setUnreadCount]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      const response = await notificationService.deleteAllRead();
      setUnreadCount(response.unreadCount);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => !notification.read)
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete read notifications';
      setError(message);
      console.error('Error deleting read notifications:', err);
    }
  }, [setUnreadCount]);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error refreshing unread count:', err);
    }
  }, [setUnreadCount]);

  // Initial load of unread count
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    fetchRecentNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshUnreadCount
  };
};
