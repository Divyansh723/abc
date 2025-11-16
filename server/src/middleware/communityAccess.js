import User from '../models/User.js';

/**
 * Middleware to check if user has community features enabled
 * Blocks access if privacySettings.shareWithCommunity is false
 */
export const checkCommunityAccess = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const user = await User.findById(userId).select('privacySettings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if community features are enabled
    if (!user.privacySettings?.shareWithCommunity) {
      return res.status(403).json({
        success: false,
        message: 'Community features are disabled in your privacy settings',
        code: 'COMMUNITY_DISABLED',
        action: {
          text: 'Update Privacy Settings',
          url: '/settings/privacy'
        }
      });
    }
    
    // User has access, continue
    next();
  } catch (error) {
    console.error('Community access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify community access'
    });
  }
};
