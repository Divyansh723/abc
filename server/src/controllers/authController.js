import { User } from '../models/index.js';
import { 
  generateTokens, 
  storeRefreshToken, 
  verifyRefreshToken, 
  removeRefreshToken,
  clearAllRefreshTokens 
} from '../middleware/auth.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, timezone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Store refresh token
    await storeRefreshToken(user._id, refreshToken);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token: accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive || user.softDeleted) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Store refresh token
    await storeRefreshToken(user._id, refreshToken);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token: accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Refresh access token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const user = await verifyRefreshToken(refreshToken);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Remove old refresh token and store new one
    await removeRefreshToken(user._id, refreshToken);
    await storeRefreshToken(user._id, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user._id;

    if (refreshToken) {
      await removeRefreshToken(userId, refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// Logout from all devices
export const logoutAll = async (req, res) => {
  try {
    const userId = req.user._id;
    await clearAllRefreshTokens(userId);

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.refreshTokens;
    delete updates.isActive;
    delete updates.softDeleted;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during profile update'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear all refresh tokens (force re-login on all devices)
    await clearAllRefreshTokens(userId);

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password change'
    });
  }
};

// Request password reset (placeholder - would integrate with email service)
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // TODO: Generate reset token and send email
    // For now, just return success
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset password (placeholder)
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // TODO: Verify reset token and update password
    // For now, just return error
    res.status(400).json({
      success: false,
      message: 'Password reset functionality not yet implemented'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    console.log('Deleting account for user:', userId);

    // Import models dynamically
    const Habit = (await import('../models/Habit.js')).default;
    const Completion = (await import('../models/Completion.js')).default;
    const MoodEntry = (await import('../models/MoodEntry.js')).default;
    const XPTransaction = (await import('../models/XPTransaction.js')).default;
    const Notification = (await import('../models/Notification.js')).default;
    const CommunityCircle = (await import('../models/CommunityCircle.js')).default;

    // Find circles where user is admin
    const adminCircles = await CommunityCircle.find({
      'members': {
        $elemMatch: {
          userId: userId,
          role: 'admin'
        }
      }
    });

    console.log(`Found ${adminCircles.length} circles where user is admin`);

    // Delete circles and notify members
    for (const circle of adminCircles) {
      const circleName = circle.name;
      const memberIds = circle.members
        .map(m => m.userId)
        .filter(id => id && id.toString() !== userId.toString());

      // Delete the circle
      await CommunityCircle.findByIdAndDelete(circle._id);
      console.log(`Deleted circle: ${circleName}`);

      // Send notifications to all members
      if (memberIds.length > 0) {
        const notifications = memberIds.map(memberId => ({
          userId: memberId,
          type: 'community',
          title: 'Community Circle Deleted',
          message: `The community circle "${circleName}" has been deleted because the admin deleted their account.`,
          read: false
        }));

        await Notification.insertMany(notifications);
        console.log(`Sent deletion notifications to ${memberIds.length} members of ${circleName}`);
      }
    }

    // Delete all user data
    const deletionResults = await Promise.allSettled([
      Habit.deleteMany({ userId }),
      Completion.deleteMany({ userId }),
      MoodEntry.deleteMany({ userId }),
      XPTransaction.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      // Remove user from community circles (non-admin circles)
      CommunityCircle.updateMany(
        { 'members.userId': userId },
        { $pull: { members: { userId } } }
      ),
      // Clear all refresh tokens
      clearAllRefreshTokens(userId)
    ]);

    console.log('Deletion results:', deletionResults);

    // Delete the user account
    await User.findByIdAndDelete(userId);

    console.log('User account deleted successfully');

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};
