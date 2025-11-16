import mongoose from 'mongoose';

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mood: {
    type: Number,
    required: true,
    min: [1, 'Mood must be between 1 and 5'],
    max: [5, 'Mood must be between 1 and 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Mood must be an integer'
    }
  },
  energy: {
    type: Number,
    required: true,
    min: [1, 'Energy must be between 1 and 5'],
    max: [5, 'Energy must be between 1 and 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Energy must be an integer'
    }
  },
  stress: {
    type: Number,
    required: true,
    min: [1, 'Stress must be between 1 and 5'],
    max: [5, 'Stress must be between 1 and 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Stress must be an integer'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
moodEntrySchema.index({ userId: 1, date: -1 });
moodEntrySchema.index({ userId: 1, createdAt: -1 });

// Ensure one mood entry per user per day
moodEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

// Transform output to match frontend expectations
moodEntrySchema.methods.toJSON = function() {
  const entry = this.toObject();
  
  // Transform _id to id
  entry.id = entry._id;
  delete entry._id;
  delete entry.__v;
  
  return entry;
};

const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);

export default MoodEntry;