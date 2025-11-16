import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['health', 'fitness', 'productivity', 'learning', 'mindfulness', 'social', 'creativity', 'finance', 'other'],
    default: 'other'
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  customFrequency: {
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    }],
    timesPerWeek: {
      type: Number,
      min: 1,
      max: 7
    }
  },
  reminderTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
  },
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format. Use hex color']
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    maxlength: [10, 'Icon cannot exceed 10 characters']
  },
  active: {
    type: Boolean,
    default: true
  },
  archived: {
    type: Boolean,
    default: false
  },
  // Calculated fields (updated by completions)
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCompletions: {
    type: Number,
    default: 0,
    min: 0
  },
  consistencyRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Metadata
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: 1,
    max: 1440 // 24 hours
  },
  // Challenge linking
  isChallengeHabit: {
    type: Boolean,
    default: false
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityCircle.challenges'
  },
  circleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityCircle'
  },
  autoDeleteOnChallengeEnd: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
habitSchema.index({ userId: 1, active: 1 });
habitSchema.index({ userId: 1, createdAt: -1 });
habitSchema.index({ category: 1 });
habitSchema.index({ active: 1, archived: 1 });

// Virtual for habit completions
habitSchema.virtual('completions', {
  ref: 'Completion',
  localField: '_id',
  foreignField: 'habitId'
});

// Virtual for recent completions (last 30 days)
habitSchema.virtual('recentCompletions', {
  ref: 'Completion',
  localField: '_id',
  foreignField: 'habitId',
  match: {
    completedAt: {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }
  }
});

// Static method to find active habits for a user
habitSchema.statics.findActiveByUser = function(userId) {
  return this.find({ 
    userId, 
    active: true, 
    archived: false 
  }).sort({ createdAt: -1 });
};

// Static method to find habits by category
habitSchema.statics.findByCategory = function(userId, category) {
  return this.find({ 
    userId, 
    category, 
    active: true, 
    archived: false 
  }).sort({ createdAt: -1 });
};

// Instance method to archive habit
habitSchema.methods.archive = function() {
  this.archived = true;
  this.active = false;
  return this.save();
};

// Instance method to recalculate all statistics
habitSchema.methods.recalculateStats = async function() {
  const Completion = mongoose.model('Completion');
  
  // Get total completions
  this.totalCompletions = await Completion.countDocuments({ habitId: this._id });
  
  // Calculate streak
  await this.calculateStreak();
  
  // Calculate consistency rate (last 30 days) - frequency-aware
  const { calculateConsistencyRate } = await import('../utils/streakCalculation.js');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCompletions = await Completion.find({
    habitId: this._id,
    completedAt: { $gte: thirtyDaysAgo }
  });
  
  const timezone = 'UTC'; // TODO: Get from user preferences
  this.consistencyRate = calculateConsistencyRate(this, recentCompletions, 30, timezone);
  
  return this.save();
};

// Instance method to calculate streak (frequency-aware)
habitSchema.methods.calculateStreak = async function(session = null) {
  const Completion = mongoose.model('Completion');
  const { calculateHabitStreak } = await import('../utils/streakCalculation.js');
  
  // Get completions for this habit, sorted by date descending
  // Use session if provided to see uncommitted changes in transaction
  const query = Completion.find({ 
    habitId: this._id 
  }).sort({ completedAt: -1 });
  
  if (session) {
    query.session(session);
  }
  
  const completions = await query;

  if (completions.length === 0) {
    this.currentStreak = 0;
    return 0;
  }

  // Use frequency-aware streak calculation
  const timezone = 'UTC'; // TODO: Get from user preferences
  const { currentStreak, longestStreak } = calculateHabitStreak(this, completions, timezone);
  
  this.currentStreak = currentStreak;
  this.longestStreak = Math.max(this.longestStreak, longestStreak);
  
  return currentStreak;
};

// Transform output to match frontend expectations
habitSchema.methods.toJSON = function() {
  const habit = this.toObject();
  
  // Transform _id to id
  habit.id = habit._id;
  delete habit._id;
  delete habit.__v;
  
  return habit;
};

// Pre-remove hook: Remove user from challenge when they delete a challenge habit
habitSchema.pre('findOneAndDelete', async function(next) {
  try {
    const habit = await this.model.findOne(this.getFilter());
    
    if (habit && habit.isChallengeHabit && habit.challengeId && habit.circleId) {
      const CommunityCircle = mongoose.model('CommunityCircle');
      const circle = await CommunityCircle.findById(habit.circleId);
      
      if (circle) {
        const challenge = circle.challenges.id(habit.challengeId);
        if (challenge) {
          // Remove user from challenge participants
          const participantIndex = challenge.participants.findIndex(
            p => p.userId.toString() === habit.userId.toString()
          );
          
          if (participantIndex !== -1) {
            challenge.participants.splice(participantIndex, 1);
            await circle.save();
            console.log(`Removed user ${habit.userId} from challenge ${habit.challengeId} after habit deletion`);
          }
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in habit pre-remove hook:', error);
    next(error);
  }
});

// Pre-remove hook for deleteMany operations
habitSchema.pre('deleteMany', async function(next) {
  try {
    const habits = await this.model.find(this.getFilter());
    
    for (const habit of habits) {
      if (habit.isChallengeHabit && habit.challengeId && habit.circleId) {
        const CommunityCircle = mongoose.model('CommunityCircle');
        const circle = await CommunityCircle.findById(habit.circleId);
        
        if (circle) {
          const challenge = circle.challenges.id(habit.challengeId);
          if (challenge) {
            // Remove user from challenge participants
            const participantIndex = challenge.participants.findIndex(
              p => p.userId.toString() === habit.userId.toString()
            );
            
            if (participantIndex !== -1) {
              challenge.participants.splice(participantIndex, 1);
              await circle.save();
              console.log(`Removed user ${habit.userId} from challenge ${habit.challengeId} after habit deletion`);
            }
          }
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in habit deleteMany pre-hook:', error);
    next(error);
  }
});

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;