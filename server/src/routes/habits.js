import express from 'express';
import {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  markComplete,
  useForgiveness,
  getHabitStats,
  getHabitCompletions,
  getTodayCompletions,
  recalculateHabitStats
} from '../controllers/habitController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateHabitCreation,
  validateHabitUpdate,
  validateCompletion,
  validateObjectId,
  validateDateRange,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Habit CRUD operations
router.get('/', getHabits);
router.post('/', validateHabitCreation, createHabit);

// Today's completions (special route)
router.get('/completions/today', getTodayCompletions);

// Utility routes
router.post('/recalculate-stats', recalculateHabitStats);

// Individual habit operations
router.get('/:habitId', validateObjectId('habitId'), getHabit);
router.patch('/:habitId', validateObjectId('habitId'), validateHabitUpdate, updateHabit);
router.delete('/:habitId', validateObjectId('habitId'), deleteHabit);

// Habit actions
router.post('/:habitId/archive', validateObjectId('habitId'), archiveHabit);
router.post('/:habitId/complete', validateObjectId('habitId'), validateCompletion, markComplete);
router.post('/:habitId/forgiveness', validateObjectId('habitId'), validateCompletion, useForgiveness);

// Habit analytics
router.get('/:habitId/stats', validateObjectId('habitId'), validateDateRange, getHabitStats);
router.get('/:habitId/completions', validateObjectId('habitId'), validateDateRange, validatePagination, getHabitCompletions);

export default router;