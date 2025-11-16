import mongoose from 'mongoose';

const aiInteractionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  interactionType: {
    type: String,
    enum: ['coaching', 'motivational_content', 'personalized_coaching'],
    required: true
  },
  context: {
    type: String,
    default: 'general'
  },
  challenge: {
    type: String,
    default: null
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  modelUsed: {
    type: String,
    default: null
  },
  success: {
    type: Boolean,
    required: true
  },
  errorMessage: {
    type: String,
    default: null
  },
  responseTime: {
    type: Number, // in milliseconds
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
aiInteractionLogSchema.index({ userId: 1, timestamp: -1 });
aiInteractionLogSchema.index({ interactionType: 1, timestamp: -1 });
aiInteractionLogSchema.index({ success: 1, timestamp: -1 });

// Static method to log interaction
aiInteractionLogSchema.statics.logInteraction = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
    // Don't throw error - logging failure shouldn't break the main flow
    return null;
  }
};

// Static method to get user's coaching history
aiInteractionLogSchema.statics.getUserCoachingHistory = async function(userId, limit = 50) {
  try {
    return await this.find({
      userId,
      interactionType: { $in: ['coaching', 'motivational_content', 'personalized_coaching'] }
    })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('-requestData -responseData') // Exclude large data fields for overview
    .lean();
  } catch (error) {
    console.error('Failed to get coaching history:', error);
    return [];
  }
};

// Static method to get interaction statistics
aiInteractionLogSchema.statics.getInteractionStats = async function(userId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          timestamp: { $gte: startDate },
          interactionType: { $in: ['coaching', 'motivational_content', 'personalized_coaching'] }
        }
      },
      {
        $group: {
          _id: '$interactionType',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: ['$success', 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    return stats;
  } catch (error) {
    console.error('Failed to get interaction stats:', error);
    return [];
  }
};

const AIInteractionLog = mongoose.model('AIInteractionLog', aiInteractionLogSchema);

export default AIInteractionLog;
