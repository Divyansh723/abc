import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'habit',
      'achievement',
      'challenge',
      'community',
      'system',
      'habit_reminder',
      'streak_milestone',
      'daily_summary',
      'weekly_insights',
      'challenge_update',
      'community_activity',
      'system_update',
      'tips_tricks'
    ],
    index: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  message: {
    type: String,
    required: true,
    maxLength: 500
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  actionUrl: {
    type: String,
    maxLength: 200
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Transform output to match frontend expectations
notificationSchema.methods.toJSON = function() {
  const notification = this.toObject();
  // Transform _id to id
  notification.id = notification._id;
  delete notification._id;
  delete notification.__v;
  return notification;
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds) {
  try {
    console.log('Notification.markAsRead: userId =', userId);
    console.log('Notification.markAsRead: notificationIds =', notificationIds);
    
    // Convert string IDs to ObjectIds if needed
    const objectIds = notificationIds.map(id => {
      if (typeof id === 'string') {
        return new mongoose.Types.ObjectId(id);
      }
      return id;
    });
    
    console.log('Notification.markAsRead: Converted objectIds =', objectIds);
    
    const result = await this.updateMany(
      { 
        userId, 
        _id: { $in: objectIds }
      },
      { read: true }
    );
    
    console.log('Notification.markAsRead: Update result =', result);
    return result;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  try {
    const count = await this.countDocuments({ userId, read: false });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
