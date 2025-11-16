import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getAllChallenges,
  getChallengeById,
  joinChallenge,
  getActiveParticipations,
  getChallengeHistory,
  abandonChallenge,
  updateChallengeProgress
} from '../controllers/challengeController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Challenge routes
router.get('/personal', getAllChallenges);
router.get('/personal/:id', getChallengeById);
router.post('/personal/:challengeId/join', joinChallenge);

// Participation routes
router.get('/personal/participations/active', getActiveParticipations);
router.get('/personal/history/all', getChallengeHistory);
router.post('/personal/participations/:participationId/abandon', abandonChallenge);

// Progress update (called internally when habits are completed)
router.post('/progress/update', updateChallengeProgress);

export default router;
