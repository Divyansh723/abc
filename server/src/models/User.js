import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  totalXP: {
    type: Number,
    default: 0,
    min: 0
  },
  forgivenessTokens: {
    type: Number,
    default: 3,
    min: 0,
    max: 3
  },
  challengeParticipations: [{
    challengeId: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    habitSnapshotAtJoin: [{
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      category: String,
      currentStreak: Number
    }],
    completedAt: Date,
    xpEarned: {
      type: Number,
      default: 0
    }
  }],
  aiOptOut: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  accentColor: {
    type: String,
    enum: ['blue', 'purple', 'green', 'orange', 'pink', 'red', 'teal', 'indigo'],
    default: 'blue'
  },
  notificationPreferences: {
    push: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String,
      default: '09:00'
    },
    habitReminders: {
      type: Boolean,
      default: true
    },
    streakMilestones: {
      type: Boolean,
      default: true
    },
    dailySummary: {
      type: Boolean,
      default: true
    },
    weeklyInsights: {
      type: Boolean,
      default: true
    },
    challengeUpdates: {
      type: Boolean,
      default: true
    },
    communityActivity: {
      type: Boolean,
      default: false
    },
    systemUpdates: {
      type: Boolean,
      default: true
    },
    tipsAndTricks: {
      type: Boolean,
      default: false
    },
    autoForgiveness: {
      type: Boolean,
      default: true
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: true
      },
      start: {
        type: String,
        default: '22:00'
      },
      end: {
        type: String,
        default: '08:00'
      }
    },
    soundEnabled: {
      type: Boolean,
      default: true
    }
  },
  privacySettings: {
    shareWithCommunity: {
      type: Boolean,
      default: true
    },
    allowAIPersonalization: {
      type: Boolean,
      default: true
    },
    showOnLeaderboard: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'private'
    },
    habitDataSharing: {
      type: Boolean,
      default: false
    },
    analyticsSharing: {
      type: Boolean,
      default: false
    },
    thirdPartySharing: {
      type: Boolean,
      default: false
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    dataRetention: {
      type: String,
      enum: ['6months', '1year', '2years', 'indefinite'],
      default: '1year'
    }
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000 // 30 days
    }
  }],
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  softDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ softDeleted: 1, isActive: 1 });

// Virtual for user's habits
userSchema.virtual('habits', {
  ref: 'Habit',
  localField: '_id',
  foreignField: 'userId'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate auth tokens
userSchema.methods.generateAuthTokens = function() {
  // This will be implemented in the auth controller
  return {
    accessToken: null,
    refreshToken: null
  };
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true, softDeleted: false });
};

// Instance method to soft delete user
userSchema.methods.softDelete = function() {
  this.softDeleted = true;
  this.isActive = false;
  return this.save();
};

// Transform output to match frontend expectations
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  
  // Remove sensitive fields
  delete user.password;
  delete user.refreshTokens;
  delete user.__v;
  
  // Transform _id to id
  user.id = user._id;
  delete user._id;
  
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;