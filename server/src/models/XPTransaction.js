import mongoose from 'mongoose';

const xpTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: false // Some XP might not be habit-related
  },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value !== 0;
      },
      message: 'XP amount must be a non-zero integer'
    }
  },
  source: {
    type: String,
    enum: ['habit_completion', 'streak_bonus', 'achievement', 'challenge', 'level_bonus', 'daily_bonus', 'habit_deletion_refund', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  metadata: {
    streakLength: {
      type: Number,
      min: 0
    },
    multiplier: {
      type: Number,
      min: 0
    },
    achievementId: String,
    challengeId: String,
    newLevel: {
      type: Number,
      min: 1
    },
    oldLevel: {
      type: Number,
      min: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
xpTransactionSchema.index({ userId: 1, createdAt: -1 });
xpTransactionSchema.index({ userId: 1, source: 1 });
xpTransactionSchema.index({ habitId: 1, createdAt: -1 });

// Transform output to match frontend expectations
xpTransactionSchema.methods.toJSON = function() {
  const transaction = this.toObject();
  
  // Transform _id to id
  transaction.id = transaction._id;
  delete transaction._id;
  delete transaction.__v;
  
  return transaction;
};

const XPTransaction = mongoose.model('XPTransaction', xpTransactionSchema);

export default XPTransaction;