export interface Notification {
  id: string;
  userId: string;
  type: 'habit' | 'achievement' | 'challenge' | 'community' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
  unreadCount: number;
}

export interface NotificationFilters {
  type: 'all' | 'habit' | 'achievement' | 'challenge' | 'community' | 'system';
  read?: boolean;
  page: number;
  limit: number;
}
