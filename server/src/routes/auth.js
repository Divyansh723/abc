import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getCurrentUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  deleteAccount
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/me', getCurrentUser);
router.patch('/profile', updateProfile);
router.post('/change-password', validatePasswordChange, changePassword);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.delete('/delete-account', deleteAccount);

export default router;