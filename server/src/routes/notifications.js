import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getNotifications,
  getRecentNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getUnreadCount
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get notifications with pagination and filtering
router.get('/', getNotifications);

// Get recent notifications for dropdown
router.get('/recent', getRecentNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notifications as read
router.patch('/mark-read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Delete all read notifications
router.delete('/read/all', deleteAllRead);

export default router;
