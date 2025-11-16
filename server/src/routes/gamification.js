import express from 'express';
import { 
  getGamificationData, 
  addXP, 
  useForgivenessToken, 
  getXPHistory,
  getAchievements,
  getChallenges,
  getChallengeParticipations,
  joinChallenge,
  leaveChallenge,
  updateChallengeProgress
} from '../controllers/gamificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user's gamification data
router.get('/data', getGamificationData);

// Add XP to user
router.post('/xp', addXP);

// Use forgiveness token
router.post('/forgiveness', useForgivenessToken);

// Get XP transaction history
router.get('/xp/history', getXPHistory);

// Achievement routes
router.get('/achievements', getAchievements);

// Challenge routes
router.get('/challenges', getChallenges);
router.get('/challenges/participations', getChallengeParticipations);
router.post('/challenges/join', joinChallenge);
router.post('/challenges/leave', leaveChallenge);
router.post('/challenges/progress', updateChallengeProgress);

export default router;