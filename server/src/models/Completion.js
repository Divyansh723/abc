import mongoose from 'mongoose';

const completionSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: [true, 'Habit ID is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  completedAt: {
    type: Date,
    required: [true, 'Completion date is required'],
    index: true
  },
  deviceTimezone: {
    type: String,
    required: [true, 'Device timezone is required']
  },
  xpEarned: {
    type: Number,
    default: 10,
    min: 0
  },
  editedFlag: {
    type: Boolean,
    default: false
  },
  forgivenessUsed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  mood: {
    type: Number,
    min: 1,
    max: 5
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
completionSchema.index({ habitId: 1, completedAt: -1 });
completionSchema.index({ userId: 1, completedAt: -1 });
completionSchema.index({ userId: 1, habitId: 1, completedAt: -1 });

// Unique constraint to prevent duplicate completions on the same day
completionSchema.index(
  { 
    habitId: 1, 
    completedAt: 1 
  }, 
  { 
    unique: true,
    partialFilterExpression: {
      // Only apply uniqueness to the same calendar day
      completedAt: { $exists: true }
    }
  }
);

// Virtual for habit details
completionSchema.virtual('habit', {
  ref: 'Habit',
  localField: 'habitId',
  foreignField: '_id',
  justOne: true
});

// Virtual for user details
completionSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Static method to find completions by date range
completionSchema.statics.findByDateRange = function(userId, startDate, endDate, habitId = null) {
  const query = {
    userId,
    completedAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (habitId) {
    query.habitId = habitId;
  }
  
  return this.find(query).sort({ completedAt: -1 });
};

// Static method to find today's completions
completionSchema.statics.findTodayCompletions = function(userId, timezone = 'UTC') {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    userId,
    completedAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
};

// Static method to get completion stats
completionSchema.statics.getStats = async function(userId, habitId = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    completedAt: { $gte: startDate }
  };
  
  if (habitId) {
    matchStage.habitId = new mongoose.Types.ObjectId(habitId);
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCompletions: { $sum: 1 },
        totalXP: { $sum: '$xpEarned' },
        averageXPPerDay: { $avg: '$xpEarned' },
        completionsByDay: {
          $push: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
            xp: '$xpEarned',
            mood: '$mood'
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalCompletions: 0,
    totalXP: 0,
    averageXPPerDay: 0,
    completionsByDay: []
  };
};

// Instance method to check if completion is on same day
completionSchema.methods.isSameDay = function(otherDate) {
  const thisDate = new Date(this.completedAt);
  const compareDate = new Date(otherDate);
  
  return thisDate.toDateString() === compareDate.toDateString();
};

// Pre-save middleware to update habit stats
completionSchema.post('save', async function() {
  try {
    const Habit = mongoose.model('Habit');
    const habit = await Habit.findById(this.habitId);
    
    if (habit) {
      // Recalculate habit stats
      await habit.calculateStreak();
      
      // Update total completions
      const totalCompletions = await mongoose.model('Completion').countDocuments({
        habitId: this.habitId
      });
      
      habit.totalCompletions = totalCompletions;
      
      // Calculate consistency rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentCompletions = await mongoose.model('Completion').countDocuments({
        habitId: this.habitId,
        completedAt: { $gte: thirtyDaysAgo }
      });
      
      habit.consistencyRate = Math.round((recentCompletions / 30) * 100);
      
      await habit.save();
    }
  } catch (error) {
    console.error('Error updating habit stats:', error);
  }
});

// Transform output to match frontend expectations
completionSchema.methods.toJSON = function() {
  const completion = this.toObject();
  
  // Transform _id to id
  completion.id = completion._id;
  delete completion._id;
  delete completion.__v;
  
  return completion;
};

const Completion = mongoose.model('Completion', completionSchema);

export default Completion;