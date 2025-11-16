import mongoose from 'mongoose';

const circleMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  optOutOfLeaderboard: {
    type: Boolean,
    default: false
  },
  communityPoints: {
    type: Number,
    default: 0
  }
});

const circleEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const circleChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['streak', 'completion', 'consistency'],
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  pointsReward: {
    type: Number,
    required: true,
    default: 50
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Habit template for auto-creation
  habitTemplate: {
    name: {
      type: String,
      required: true,
      maxlength: 100
    },
    description: {
      type: String,
      maxlength: 500
    },
    category: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily'
    },
    customFrequency: {
      daysOfWeek: [Number], // 0-6 for Sunday-Saturday
      timesPerWeek: Number
    },
    reminderTime: String,
    icon: String
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit'
    },
    progress: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const circleMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reported: {
    type: Boolean,
    default: false
  },
  reportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportReasons: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'inappropriate', 'offensive', 'other']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  hidden: {
    type: Boolean,
    default: false
  }
});

const circleAnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const communityCircleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [circleMemberSchema],
  maxMembers: {
    type: Number,
    default: 10,
    min: 2,
    max: 100
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  moderationSettings: {
    maxMessagesPerDay: {
      type: Number,
      default: 100
    },
    profanityFilterEnabled: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  messages: [circleMessageSchema],
  events: [circleEventSchema],
  challenges: [circleChallengeSchema],
  announcements: [circleAnnouncementSchema],
  leaderboardUpdateDay: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    default: 'Sunday'
  },
  lastLeaderboardUpdate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
communityCircleSchema.index({ createdBy: 1 });
communityCircleSchema.index({ 'members.userId': 1 });
communityCircleSchema.index({ inviteCode: 1 });

// Virtual for member count
communityCircleSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for available spots
communityCircleSchema.virtual('availableSpots').get(function() {
  return this.maxMembers - this.members.length;
});

// Method to check if user is member
communityCircleSchema.methods.isMember = function(userId) {
  return this.members.some(m => {
    // Handle both populated (object with _id) and unpopulated (ObjectId) cases
    const memberId = m.userId._id || m.userId;
    return memberId.toString() === userId.toString();
  });
};

// Method to check if user is admin
communityCircleSchema.methods.isAdmin = function(userId) {
  const member = this.members.find(m => {
    // Handle both populated (object with _id) and unpopulated (ObjectId) cases
    const memberId = m.userId._id || m.userId;
    return memberId.toString() === userId.toString();
  });
  return member && member.role === 'admin';
};

// Method to add member
communityCircleSchema.methods.addMember = function(userId, role = 'member') {
  if (this.isMember(userId)) {
    throw new Error('User is already a member');
  }
  if (this.members.length >= this.maxMembers) {
    throw new Error('Circle is full');
  }
  this.members.push({ userId, role });
  return this.save();
};

// Method to remove member
communityCircleSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(m => m.userId.toString() === userId.toString());
  if (memberIndex === -1) {
    throw new Error('User is not a member');
  }
  this.members.splice(memberIndex, 1);
  return this.save();
};

// Method to add message
communityCircleSchema.methods.addMessage = function(userId, content) {
  if (!this.isMember(userId)) {
    throw new Error('Only members can post messages');
  }
  
  // Check rate limiting
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const userMessagesToday = this.messages.filter(m => 
    m.userId.toString() === userId.toString() && 
    m.createdAt >= today
  ).length;
  
  if (userMessagesToday >= this.moderationSettings.maxMessagesPerDay) {
    throw new Error('Daily message limit reached');
  }
  
  this.messages.push({ userId, content });
  return this.save();
};

// Method to add announcement
communityCircleSchema.methods.addAnnouncement = function(userId, { title, content, isImportant = false }) {
  if (!this.isAdmin(userId)) {
    throw new Error('Only admins can create announcements');
  }
  
  this.announcements.push({ 
    title, 
    content, 
    isImportant,
    createdBy: userId 
  });
  return this.save();
};

// Method to promote member to admin
communityCircleSchema.methods.promoteMember = function(userId, targetUserId) {
  if (!this.isAdmin(userId)) {
    throw new Error('Only admins can promote members');
  }
  const member = this.members.find(m => m.userId.toString() === targetUserId.toString());
  if (!member) {
    throw new Error('User is not a member');
  }
  member.role = 'admin';
  return this.save();
};

// Method to remove member (admin only)
communityCircleSchema.methods.removeMemberByAdmin = function(adminId, targetUserId) {
  if (!this.isAdmin(adminId)) {
    throw new Error('Only admins can remove members');
  }
  if (this.createdBy.toString() === targetUserId.toString()) {
    throw new Error('Cannot remove circle creator');
  }
  return this.removeMember(targetUserId);
};

// Method to add community points
communityCircleSchema.methods.addCommunityPoints = function(userId, points) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('User is not a member');
  }
  member.communityPoints = (member.communityPoints || 0) + points;
  return this.save();
};

// Method to add event
communityCircleSchema.methods.addEvent = function(userId, eventData) {
  if (!this.isAdmin(userId)) {
    throw new Error('Only admins can create events');
  }
  this.events.push({
    ...eventData,
    createdBy: userId
  });
  return this.save();
};

// Method to add challenge
communityCircleSchema.methods.addChallenge = function(userId, challengeData) {
  if (!this.isAdmin(userId)) {
    throw new Error('Only admins can create challenges');
  }
  this.challenges.push({
    ...challengeData,
    createdBy: userId
  });
  return this.save();
};

// Method to join challenge
communityCircleSchema.methods.joinChallenge = async function(userId, challengeId) {
  if (!this.isMember(userId)) {
    throw new Error('Only members can join challenges');
  }
  const challenge = this.challenges.id(challengeId);
  if (!challenge) {
    throw new Error('Challenge not found');
  }
  const alreadyJoined = challenge.participants.some(p => p.userId.toString() === userId.toString());
  if (alreadyJoined) {
    throw new Error('Already joined this challenge');
  }
  
  // Create habit from template if it exists
  let habitId = null;
  if (challenge.habitTemplate && challenge.habitTemplate.name) {
    const Habit = mongoose.model('Habit');
    const habit = new Habit({
      userId,
      name: challenge.habitTemplate.name,
      description: challenge.habitTemplate.description || `Challenge: ${challenge.title}`,
      category: challenge.habitTemplate.category,
      frequency: challenge.habitTemplate.frequency || 'daily',
      customFrequency: challenge.habitTemplate.customFrequency,
      reminderTime: challenge.habitTemplate.reminderTime,
      reminderEnabled: !!challenge.habitTemplate.reminderTime,
      color: '#8B5CF6', // Purple for challenge habits
      icon: challenge.habitTemplate.icon || '🎯',
      active: true,
      isChallengeHabit: true,
      challengeId: challengeId,
      circleId: this._id,
      autoDeleteOnChallengeEnd: true
    });
    await habit.save();
    habitId = habit._id;
  } else {
    // If no habit template, check if user has any active habits
    const Habit = mongoose.model('Habit');
    const userHabits = await Habit.find({ userId, active: true });
    
    if (userHabits.length === 0) {
      throw new Error('Please create habit to join the challenge');
    }
  }
  
  challenge.participants.push({ 
    userId, 
    habitId,
    progress: 0, 
    completed: false,
    joinedAt: new Date()
  });
  return this.save();
};

// Method to leave challenge
communityCircleSchema.methods.leaveChallenge = async function(userId, challengeId) {
  const challenge = this.challenges.id(challengeId);
  if (!challenge) {
    throw new Error('Challenge not found');
  }
  
  const participantIndex = challenge.participants.findIndex(p => p.userId.toString() === userId.toString());
  if (participantIndex === -1) {
    throw new Error('Not participating in this challenge');
  }
  
  const participant = challenge.participants[participantIndex];
  
  // Delete the associated habit if it exists
  if (participant.habitId) {
    const Habit = mongoose.model('Habit');
    await Habit.findByIdAndDelete(participant.habitId);
  }
  
  // Remove participant
  challenge.participants.splice(participantIndex, 1);
  return this.save();
};

// Method to update challenge progress
communityCircleSchema.methods.updateChallengeProgress = function(userId, challengeId, progress) {
  const challenge = this.challenges.id(challengeId);
  if (!challenge) {
    throw new Error('Challenge not found');
  }
  const participant = challenge.participants.find(p => p.userId.toString() === userId.toString());
  if (!participant) {
    throw new Error('Not participating in this challenge');
  }
  participant.progress = progress;
  if (progress >= challenge.target && !participant.completed) {
    participant.completed = true;
    participant.completedAt = new Date();
    // Award community points
    this.addCommunityPoints(userId, challenge.pointsReward);
  }
  return this.save();
};

// Static method to clean up ended challenges
communityCircleSchema.statics.cleanupEndedChallenges = async function() {
  const Habit = mongoose.model('Habit');
  const now = new Date();
  
  // Find all circles with ended challenges
  const circles = await this.find({
    'challenges.endDate': { $lt: now }
  });
  
  for (const circle of circles) {
    for (const challenge of circle.challenges) {
      if (challenge.endDate < now) {
        // Delete all associated habits
        const habitIds = challenge.participants
          .filter(p => p.habitId)
          .map(p => p.habitId);
        
        if (habitIds.length > 0) {
          await Habit.deleteMany({
            _id: { $in: habitIds },
            autoDeleteOnChallengeEnd: true
          });
          
          console.log(`Deleted ${habitIds.length} habits for ended challenge: ${challenge.title}`);
        }
      }
    }
  }
};

// Method to clean up deleted user references
communityCircleSchema.methods.cleanupDeletedUsers = async function() {
  const User = mongoose.model('User');
  let modified = false;
  
  // Check and remove members with deleted accounts
  const validMembers = [];
  for (const member of this.members) {
    const userExists = await User.exists({ _id: member.userId });
    if (userExists) {
      validMembers.push(member);
    } else {
      console.log(`Removing deleted user ${member.userId} from circle ${this.name}`);
      modified = true;
    }
  }
  
  if (modified) {
    this.members = validMembers;
    
    // Remove messages from deleted users
    this.messages = this.messages.filter(msg => {
      const memberExists = validMembers.some(m => m.userId.toString() === msg.userId.toString());
      return memberExists;
    });
    
    // Remove challenge participants with deleted accounts
    this.challenges.forEach(challenge => {
      challenge.participants = challenge.participants.filter(p => {
        const memberExists = validMembers.some(m => m.userId.toString() === p.userId.toString());
        return memberExists;
      });
    });
    
    await this.save();
    console.log(`Cleaned up circle ${this.name}: removed deleted user references`);
  }
  
  return modified;
};

// Static method to cleanup all circles
communityCircleSchema.statics.cleanupAllDeletedUsers = async function() {
  const circles = await this.find({});
  let totalCleaned = 0;
  
  for (const circle of circles) {
    const cleaned = await circle.cleanupDeletedUsers();
    if (cleaned) totalCleaned++;
  }
  
  console.log(`Cleaned up ${totalCleaned} circles with deleted user references`);
  return totalCleaned;
};

const CommunityCircle = mongoose.model('CommunityCircle', communityCircleSchema);

export default CommunityCircle;
