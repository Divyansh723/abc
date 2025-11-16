import aiService from '../services/aiService.js';
import { validationResult } from 'express-validator';
import AIInteractionLog from '../models/AIInteractionLog.js';

// Generate comprehensive habit insights
export const getHabitInsights = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;

    // Check if user has AI personalization enabled
    if (req.user.privacySettings && req.user.privacySettings.allowAIPersonalization === false) {
      return res.status(403).json({
        success: false,
        message: 'AI personalization is disabled in your privacy settings',
        code: 'AI_DISABLED',
        settingsPath: '/settings'
      });
    }

    const insights = await aiService.generateHabitInsights(userId);

    if (!insights.success) {
      return res.status(500).json({
        success: false,
        message: insights.error || 'Failed to generate insights'
      });
    }

    res.json({
      success: true,
      data: insights.data,
      generatedAt: insights.generatedAt
    });
  } catch (error) {
    console.error('Get habit insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating insights'
    });
  }
};

// Generate smart habit suggestions
export const getHabitSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { goals, preferences } = req.body;

    // Check if user has AI personalization enabled
    if (req.user.privacySettings && req.user.privacySettings.allowAIPersonalization === false) {
      return res.status(403).json({
        success: false,
        message: 'AI personalization is disabled in your privacy settings',
        code: 'AI_DISABLED',
        settingsPath: '/settings'
      });
    }

    const suggestions = await aiService.generateHabitSuggestions(
      userId, 
      goals || [], 
      preferences || {}
    );

    if (!suggestions.success) {
      return res.status(500).json({
        success: false,
        message: suggestions.error || 'Failed to generate habit suggestions'
      });
    }

    res.json({
      success: true,
      data: suggestions.data,
      generatedAt: suggestions.generatedAt
    });
  } catch (error) {
    console.error('Get habit suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating habit suggestions'
    });
  }
};

// Analyze habit patterns
export const analyzeHabitPatterns = async (req, res) => {
  try {
    const userId = req.user._id;
    const { habitId } = req.params;

    // Check if user has AI personalization enabled
    if (req.user.privacySettings && req.user.privacySettings.allowAIPersonalization === false) {
      return res.status(403).json({
        success: false,
        message: 'AI personalization is disabled in your privacy settings',
        code: 'AI_DISABLED',
        settingsPath: '/settings'
      });
    }

    const analysis = await aiService.analyzeHabitPatterns(userId, habitId);

    if (!analysis.success) {
      return res.status(400).json({
        success: false,
        message: analysis.error || 'Failed to analyze habit patterns'
      });
    }

    res.json({
      success: true,
      data: analysis.data,
      generatedAt: analysis.generatedAt
    });
  } catch (error) {
    console.error('Analyze habit patterns error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while analyzing habit patterns'
    });
  }
};

// Generate motivational content (with AI interaction logging)
export const getMotivationalContent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { context = 'daily' } = req.query;

    // Prepare request metadata for logging
    const requestMetadata = {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    const content = await aiService.generateMotivationalContent(userId, context, requestMetadata);

    if (!content.success) {
      return res.status(500).json({
        success: false,
        message: content.error || 'Failed to generate motivational content'
      });
    }

    res.json({
      success: true,
      data: content.data,
      generatedAt: content.generatedAt
    });
  } catch (error) {
    console.error('Get motivational content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating motivational content'
    });
  }
};

// Analyze mood-habit correlations
export const getMoodHabitCorrelation = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user has AI personalization enabled
    if (req.user.privacySettings && req.user.privacySettings.allowAIPersonalization === false) {
      return res.status(403).json({
        success: false,
        message: 'AI personalization is disabled in your privacy settings',
        code: 'AI_DISABLED',
        settingsPath: '/settings'
      });
    }

    const analysis = await aiService.analyzeMoodHabitCorrelation(userId);

    if (!analysis.success) {
      return res.status(400).json({
        success: false,
        message: analysis.error || 'Failed to analyze mood-habit correlation'
      });
    }

    res.json({
      success: true,
      data: analysis.data,
      generatedAt: analysis.generatedAt
    });
  } catch (error) {
    console.error('Get mood-habit correlation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while analyzing mood-habit correlation'
    });
  }
};

// Generate personalized coaching advice (with AI interaction logging)
export const getPersonalizedCoaching = async (req, res) => {
  try {
    const userId = req.user._id;
    const { challenge, context } = req.body;

    // Prepare request metadata for logging and AI generation
    const requestMetadata = {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      challenge: challenge || null,
      context: context || null
    };

    // Generate personalized coaching with user's specific challenge
    const coaching = await aiService.generateMotivationalContent(userId, 'coaching', requestMetadata);

    if (!coaching.success) {
      return res.status(500).json({
        success: false,
        message: coaching.error || 'Failed to generate coaching advice'
      });
    }

    res.json({
      success: true,
      data: {
        ...coaching.data,
        challenge: challenge || 'Stay consistent with your habits',
        coachingType: 'personalized'
      },
      generatedAt: coaching.generatedAt
    });
  } catch (error) {
    console.error('Get personalized coaching error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating coaching advice'
    });
  }
};

// Generate habit optimization recommendations
export const getHabitOptimization = async (req, res) => {
  try {
    const userId = req.user._id;
    const { habitId } = req.params;

    // Combine pattern analysis with general insights for optimization
    const [patterns, insights] = await Promise.all([
      aiService.analyzeHabitPatterns(userId, habitId),
      aiService.generateHabitInsights(userId)
    ]);

    const optimizationData = {
      patterns: patterns.success ? patterns.data : null,
      insights: insights.success ? insights.data : null,
      recommendations: []
    };

    // Generate specific optimization recommendations
    if (patterns.success && insights.success) {
      optimizationData.recommendations = [
        ...patterns.data.recommendations || [],
        ...insights.data.habitRecommendations?.filter(rec => 
          rec.habitId === habitId || rec.type === 'optimize'
        ) || []
      ];
    }

    res.json({
      success: true,
      data: optimizationData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get habit optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating habit optimization'
    });
  }
};

// Get AI service status
export const getAIStatus = async (req, res) => {
  try {
    const status = aiService.getModelStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get AI status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while checking AI status'
    });
  }
};

// Get user's AI coaching interaction history
export const getCoachingHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50 } = req.query;

    const history = await AIInteractionLog.getUserCoachingHistory(userId, parseInt(limit));

    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Get coaching history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching coaching history'
    });
  }
};

// Get AI interaction statistics
export const getInteractionStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const stats = await AIInteractionLog.getInteractionStats(userId, parseInt(days));

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get interaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching interaction statistics'
    });
  }
};