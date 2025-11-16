import express from 'express';
import {
  getHabitInsights,
  getHabitSuggestions,
  analyzeHabitPatterns,
  getMotivationalContent,
  getMoodHabitCorrelation,
  getPersonalizedCoaching,
  getHabitOptimization,
  getAIStatus,
  getCoachingHistory,
  getInteractionStats
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

// Comprehensive habit insights
router.get('/insights', getHabitInsights);

// Smart habit suggestions
router.post('/suggestions', getHabitSuggestions);

// Habit pattern analysis
router.get('/patterns/:habitId', validateObjectId('habitId'), analyzeHabitPatterns);

// Motivational content (with logging)
router.get('/motivation', getMotivationalContent);

// Mood-habit correlation analysis
router.get('/mood-correlation', getMoodHabitCorrelation);

// Personalized coaching (with logging)
router.post('/coaching', getPersonalizedCoaching);

// Habit optimization recommendations
router.get('/optimize/:habitId', validateObjectId('habitId'), getHabitOptimization);

// AI service status
router.get('/status', getAIStatus);

// AI Coaching Audit Trail Routes
router.get('/coaching/history', getCoachingHistory);
router.get('/coaching/stats', getInteractionStats);

export default router;