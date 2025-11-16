import express from 'express';
import { 
  createMoodEntry, 
  getMoodEntries, 
  getWellbeingScore, 
  getHabitImpactAnalysis, 
  getWellbeingInsights 
} from '../controllers/wellbeingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Mood entries
router.post('/mood-entries', createMoodEntry);
router.get('/mood-entries', getMoodEntries);

// Wellbeing analytics
router.get('/score', getWellbeingScore);
router.get('/habit-impact', getHabitImpactAnalysis);
router.get('/insights', getWellbeingInsights);

export default router;