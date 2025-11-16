import Notification from '../models/Notification.js';

// Get user notifications with pagination and filtering
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 20, 
      type, 
      read 
    } = req.query;

    console.log('getNotifications: userId =', userId);
    console.log('getNotifications: query params =', { page, limit, type, read });

    // Build filter
    const filter = { userId };
    if (type && type !== 'all') {
      // Map category to specific notification types
      const typeMapping = {
        habit: ['habit', 'habit_reminder', 'streak_milestone', 'daily_summary', 'weekly_insights'],
        achievement: ['achievement'],
        challenge: ['challenge', 'challenge_update'],
        community: ['community', 'community_activity'],
        system: ['system', 'system_update', 'tips_tricks']
      };
      
      if (typeMapping[type]) {
        filter.type = { $in: typeMapping[type] };
      } else {
        // If it's a specific type, use exact match
        filter.type = type;
      }
    }
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    console.log('getNotifications: filter =', filter);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get notifications
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`getNotifications: Found ${notifications.length} notifications`);
    if (notifications.length > 0) {
      console.log('First notification:', notifications[0]);
    }

    // Get total count for pagination
    const total = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(userId);

    console.log('getNotifications: Sending response with', {
      notificationCount: notifications.length,
      total,
      unreadCount
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get recent notifications for dropdown
export const getRecentNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent notifications',
      error: error.message
    });
  }
};

// Mark notifications as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    console.log('markAsRead: userId =', userId);
    console.log('markAsRead: notificationIds =', notificationIds);

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'notificationIds array is required'
      });
    }

    const result = await Notification.markAsRead(userId, notificationIds);
    console.log('markAsRead: Update result =', result);

    // Get updated unread count
    const unreadCount = await Notification.getUnreadCount(userId);
    console.log('markAsRead: New unread count =', unreadCount);

    res.json({
      success: true,
      message: 'Notifications marked as read',
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { unreadCount: 0 }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Get updated unread count
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      message: 'Notification deleted',
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Delete all read notifications
export const deleteAllRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({
      userId,
      read: true
    });

    // Get updated unread count
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      data: { 
        deletedCount: result.deletedCount,
        unreadCount 
      }
    });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete read notifications',
      error: error.message
    });
  }
};

// Get unread count only
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};
