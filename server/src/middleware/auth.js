import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Generate JWT tokens
export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// Verify JWT token middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and attach to request
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');
      
      if (!user || !user.isActive || user.softDeleted) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found or inactive.'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.',
          code: 'INVALID_TOKEN'
        });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');
      
      if (user && user.isActive && !user.softDeleted) {
        req.user = user;
      }
    } catch (jwtError) {
      // Ignore JWT errors for optional auth
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue without user
  }
};

// Verify refresh token
export const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive || user.softDeleted) {
      throw new Error('User not found or inactive');
    }

    // Check if refresh token exists in user's token list
    const tokenExists = user.refreshTokens.some(
      tokenObj => tokenObj.token === refreshToken
    );

    if (!tokenExists) {
      throw new Error('Refresh token not found');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Store refresh token
export const storeRefreshToken = async (userId, refreshToken) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Remove old refresh tokens (keep only last 5)
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens = user.refreshTokens.slice(-4);
    }

    // Add new refresh token
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    });

    await user.save();
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw error;
  }
};

// Remove refresh token
export const removeRefreshToken = async (userId, refreshToken) => {
  try {
    const user = await User.findById(userId);
    
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(
        tokenObj => tokenObj.token !== refreshToken
      );
      await user.save();
    }
  } catch (error) {
    console.error('Error removing refresh token:', error);
  }
};

// Clear all refresh tokens (logout from all devices)
export const clearAllRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }
  } catch (error) {
    console.error('Error clearing refresh tokens:', error);
  }
};