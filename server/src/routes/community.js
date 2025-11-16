import express from 'express';
import {
  createCircle,
  getCircles,
  getCircleById,
  updateCircle,
  deleteCircle,
  joinCircle,
  leaveCircle,
  postMessage,
  getMessageStats,
  getCircleLeaderboard,
  toggleLeaderboardOptOut,
  reportMessage,
  getReportedMessages,
  deleteMessage,
  promoteMember,
  removeMember,
  createEvent,
  createChallenge,
  joinChallenge,
  updateChallengeProgress,
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
  updateChallenge,
  deleteChallenge
} from '../controllers/communityController.js';
import { authenticate } from '../middleware/auth.js';
import { checkCommunityAccess } from '../middleware/communityAccess.js';
import { body } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// All routes require community access (privacy check)
router.use(checkCommunityAccess);

// Circle management
router.post('/', [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters'),
  body('maxMembers').optional().isInt({ min: 2, max: 100 }).withMessage('Max members must be between 2 and 100'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean')
], createCircle);

router.get('/', getCircles);
router.get('/:circleId', getCircleById);
router.put('/:circleId', [
  body('name').optional().trim().isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters')
], updateCircle);
router.delete('/:circleId', deleteCircle);

// Membership
router.post('/:circleId/join', [
  body('inviteCode').optional().isString()
], joinCircle);

router.delete('/:circleId/leave', leaveCircle);

// Member management (admin only)
router.put('/:circleId/members/:memberId/promote', promoteMember);
router.delete('/:circleId/members/:memberId', removeMember);

// Messages
router.post('/:circleId/messages', [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be 1-500 characters')
], postMessage);

router.get('/:circleId/messages/stats', getMessageStats);

router.post('/:circleId/messages/:messageId/report', [
  body('reason').optional().isIn(['spam', 'harassment', 'inappropriate', 'offensive', 'other'])
], reportMessage);

// Moderation (admin only)
router.get('/:circleId/messages/reported', getReportedMessages);
router.delete('/:circleId/messages/:messageId', deleteMessage);

// Events (admin only)
router.post('/:circleId/events', [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required')
], createEvent);

// Challenges (admin only to create)
router.post('/:circleId/challenges', [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('type').isIn(['streak', 'completion', 'consistency']).withMessage('Invalid challenge type'),
  body('target').isInt({ min: 1 }).withMessage('Target must be a positive number'),
  body('pointsReward').optional().isInt({ min: 1 }).withMessage('Points reward must be a positive number'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required')
], createChallenge);

router.post('/:circleId/challenges/:challengeId/join', joinChallenge);
router.put('/:circleId/challenges/:challengeId/progress', [
  body('progress').isInt({ min: 0 }).withMessage('Progress must be a non-negative number')
], updateChallengeProgress);
router.put('/:circleId/challenges/:challengeId', [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('type').optional().isIn(['streak', 'completion', 'consistency']).withMessage('Invalid challenge type'),
  body('target').optional().isInt({ min: 1 }).withMessage('Target must be a positive number'),
  body('pointsReward').optional().isInt({ min: 1 }).withMessage('Points reward must be a positive number'),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required')
], updateChallenge);
router.delete('/:circleId/challenges/:challengeId', deleteChallenge);

// Leaderboard
router.get('/:circleId/leaderboard', getCircleLeaderboard);
router.put('/:circleId/leaderboard/opt-out', toggleLeaderboardOptOut);

// Announcements
router.post('/:circleId/announcements', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Content must be 1-1000 characters'),
  body('isImportant').optional().isBoolean().withMessage('isImportant must be a boolean')
], createAnnouncement);

router.get('/:circleId/announcements', getAnnouncements);
router.put('/:circleId/announcements/:announcementId', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Content must be 1-1000 characters'),
  body('isImportant').optional().isBoolean().withMessage('isImportant must be a boolean')
], updateAnnouncement);
router.delete('/:circleId/announcements/:announcementId', deleteAnnouncement);

export default router;
