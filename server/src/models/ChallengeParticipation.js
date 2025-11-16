import mongoose from 'mongoose';

const challengeParticipationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PersonalChallenge',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  progress: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    target: {
      type: Number,
      required: true,
      min: 1
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  completionStats: {
    daysToComplete: {
      type: Number,
      min: 0
    },
    finalScore: {
      type: Number,
      min: 0
    }
  },
  xpAwarded: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for finding user's active challenges
challengeParticipationSchema.index({ userId: 1, status: 1 });
challengeParticipationSchema.index({ userId: 1, challengeId: 1 });

// Update the updatedAt timestamp before saving
challengeParticipationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate percentage
  if (this.progress.target > 0) {
    this.progress.percentage = Math.min(100, Math.round((this.progress.current / this.progress.target) * 100));
  }
  
  next();
});

const ChallengeParticipation = mongoose.model('ChallengeParticipation', challengeParticipationSchema);

export default ChallengeParticipation;
