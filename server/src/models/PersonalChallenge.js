import mongoose from 'mongoose';

const personalChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true,
    default: '🎯'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    default: 'medium'
  },
  duration: {
    type: Number, // Duration in days
    required: true,
    min: 1,
    max: 365
  },
  requirements: {
    type: {
      type: String,
      enum: ['streak', 'total_completions', 'consistency'],
      required: true
    },
    target: {
      type: Number,
      required: true,
      min: 1
    },
    habitCategories: [{
      type: String,
      trim: true
    }]
  },
  xpReward: {
    type: Number,
    required: true,
    min: 0,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOngoing: {
    type: Boolean,
    default: true // Ongoing challenges can be joined anytime
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
personalChallengeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const PersonalChallenge = mongoose.model('PersonalChallenge', personalChallengeSchema);

export default PersonalChallenge;
