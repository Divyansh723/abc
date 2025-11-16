import User from '../models/User.js';
import XPTransaction from '../models/XPTransaction.js';
import Habit from '../models/Habit.js';
import Completion from '../models/Completion.js';
import mongoose from 'mongoose';

// Calculate level from XP
// Progressive XP system: each level requires 20% more XP than previous
// Level 1→2: 100 XP, Level 2→3: 120 XP, Level 3→4: 140 XP, etc.
const XP_BASE = 100;
const XP_MULTIPLIER = 1.2;

// Helper function to round to nearest multiple of 10
const roundToNearestTen = (value) => {
  return Math.round(value / 10) * 10;
};

const calculateLevel = (totalXP) => {
  let level = 1;
  let accumulatedXP = 0;
  let xpForNextLevel = XP_BASE;
  
  while (totalXP >= accumulatedXP + xpForNextLevel) {
    accumulatedXP += xpForNextLevel;
    level++;
    xpForNextLevel = roundToNearestTen(XP_BASE * Math.pow(XP_MULTIPLIER, level - 1));
  }
  
  return level;
};

// Calculate XP needed for next level
const calculateXPForNextLevel = (currentLevel) => {
  return roundToNearestTen(XP_BASE * Math.pow(XP_MULTIPLIER, currentLevel - 1));
};

// Calculate XP accumulated up to a specific level
const calculateXPForLevel = (level) => {
  let accumulatedXP = 0;
  for (let i = 1; i < level; i++) {
    accumulatedXP += roundToNearestTen(XP_BASE * Math.pow(XP_MULTIPLIER, i - 1));
  }
  return accumulatedXP;
};

// Get user's gamification data
export const getGamificationData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('totalXP level forgivenessTokens');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate level info
    const currentLevel = calculateLevel(user.totalXP);
    const xpForCurrentLevel = calculateXPForLevel(currentLevel);
    const xpNeededForNextLevel = calculateXPForNextLevel(currentLevel);
    const xpForNextLevel = xpForCurrentLevel + xpNeededForNextLevel;
    const progressPercentage = ((user.totalXP - xpForCurrentLevel) / xpNeededForNextLevel) * 100;

    // Get recent XP transactions
    const recentTransactions = await XPTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('habitId', 'name icon color');

    res.json({
      success: true,
      data: {
        totalXP: user.totalXP,
        currentLevel,
        xpForCurrentLevel,
        xpForNextLevel,
        progressPercentage: Math.round(progressPercentage),
        forgivenessTokens: user.forgivenessTokens,
        achievements: [], // Will be implemented later
        challengeParticipations: [], // Will be implemented later
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching gamification data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gamification data'
    });
  }
};

// Add XP to user
export const addXP = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const userId = req.user._id;
      const { amount, source, description, habitId, metadata = {} } = req.body;

      if (!amount || amount <= 0) {
        throw new Error('Invalid XP amount');
      }

      // Create XP transaction
      const transaction = new XPTransaction({
        userId,
        habitId: habitId || null,
        amount,
        source,
        description,
        metadata
      });
      await transaction.save({ session });

      // Update user's total XP
      const user = await User.findById(userId).session(session);
      const oldLevel = calculateLevel(user.totalXP);
      user.totalXP += amount;
      const newLevel = calculateLevel(user.totalXP);
      user.level = newLevel;
      await user.save({ session });

      // Check for level up
      const leveledUp = newLevel > oldLevel;
      let bonusXP = 0;
      
      if (leveledUp) {
        // Award level up bonus XP
        bonusXP = newLevel * 10;
        const bonusTransaction = new XPTransaction({
          userId,
          amount: bonusXP,
          source: 'level_bonus',
          description: `Level ${newLevel} bonus`,
          metadata: { newLevel, oldLevel }
        });
        await bonusTransaction.save({ session });
        
        user.totalXP += bonusXP;
        await user.save({ session });
      }

      res.json({
        success: true,
        data: {
          transaction,
          newTotalXP: user.totalXP,
          newLevel,
          leveledUp,
          bonusXP
        }
      });
    });
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add XP'
    });
  } finally {
    await session.endSession();
  }
};

// Use forgiveness token
export const useForgivenessToken = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const userId = req.user._id;
      const { habitId, date, timezone = 'UTC' } = req.body;

      const user = await User.findById(userId).session(session);
      if (user.forgivenessTokens <= 0) {
        throw new Error('No forgiveness tokens available');
      }

      // Create a completion entry for the missed day
      const completion = new Completion({
        userId,
        habitId,
        completedAt: new Date(date),
        xpEarned: 10, // Standard XP for forgiveness completion
        forgivenessUsed: true,
        deviceTimezone: timezone
      });
      await completion.save({ session });

      // Create XP transaction
      const xpTransaction = new XPTransaction({
        userId,
        habitId,
        amount: 10,
        source: 'habit_completion',
        description: 'Forgiveness token used',
        metadata: { forgivenessUsed: true }
      });
      await xpTransaction.save({ session });

      // Deduct forgiveness token and add XP
      user.forgivenessTokens -= 1;
      user.totalXP += 10;
      user.level = calculateLevel(user.totalXP);
      await user.save({ session });

      res.json({
        success: true,
        data: {
          completion,
          remainingTokens: user.forgivenessTokens,
          newTotalXP: user.totalXP
        }
      });
    });
  } catch (error) {
    console.error('Error using forgiveness token:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to use forgiveness token'
    });
  } finally {
    await session.endSession();
  }
};

// Get XP transactions history
export const getXPHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, source } = req.query;
    
    const query = { userId };
    if (source) {
      query.source = source;
    }

    const transactions = await XPTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('habitId', 'name icon color');

    const total = await XPTransaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching XP history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch XP history'
    });
  }
};

// Get user achievements with progress
export const getAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data for progress calculation
    const [user, habits, completions] = await Promise.all([
      User.findById(userId),
      Habit.find({ userId }),
      Completion.find({ userId })
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate progress for each achievement
    const achievements = [
      // Milestone Achievements
      {
        id: 'first-habit',
        name: 'First Steps',
        description: 'Complete your first habit and start your journey',
        icon: '🎯',
        rarity: 'common',
        category: 'milestone',
        requirement: 'Complete 1 habit',
        progress: Math.min(1, completions.length > 0 ? 1 : 0),
        maxProgress: 1,
        unlockedAt: completions.length > 0 ? completions[0].completedAt : null,
        xpReward: 10,
        workNeeded: 'Complete any habit once to unlock this achievement'
      },
      {
        id: 'habit-creator',
        name: 'Habit Creator',
        description: 'Create your first 3 habits',
        icon: '🏗️',
        rarity: 'common',
        category: 'milestone',
        requirement: 'Create 3 habits',
        progress: Math.min(3, habits.length),
        maxProgress: 3,
        unlockedAt: habits.length >= 3 ? habits[2].createdAt : null,
        xpReward: 15,
        workNeeded: 'Go to Goals page and create 3 different habits'
      },
      {
        id: 'level-5',
        name: 'Rising Star',
        description: 'Reach level 5 through consistent habit building',
        icon: '⭐',
        rarity: 'rare',
        category: 'milestone',
        requirement: 'Reach level 5',
        progress: user.level,
        maxProgress: 5,
        unlockedAt: user.level >= 5 ? new Date() : null,
        xpReward: 50,
        workNeeded: `Earn ${Math.max(0, 2500 - user.totalXP)} more XP by completing habits and challenges`
      },
      {
        id: 'level-10',
        name: 'Habit Master',
        description: 'Reach the prestigious level 10',
        icon: '🏆',
        rarity: 'epic',
        category: 'milestone',
        requirement: 'Reach level 10',
        progress: user.level,
        maxProgress: 10,
        unlockedAt: user.level >= 10 ? new Date() : null,
        xpReward: 100,
        workNeeded: `Earn ${Math.max(0, 10000 - user.totalXP)} more XP through consistent habit completion`
      },

      // Streak Achievements
      {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak with any habit',
        icon: '🔥',
        rarity: 'rare',
        category: 'streak',
        requirement: 'Maintain 7-day streak',
        progress: Math.max(...habits.map(h => h.currentStreak), 0),
        maxProgress: 7,
        unlockedAt: habits.some(h => h.currentStreak >= 7) ? new Date() : null,
        xpReward: 25,
        workNeeded: 'Complete the same habit for 7 consecutive days without missing'
      },
      {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Achieve a 30-day streak - true dedication!',
        icon: '🚀',
        rarity: 'epic',
        category: 'streak',
        requirement: 'Maintain 30-day streak',
        progress: Math.max(...habits.map(h => h.currentStreak), 0),
        maxProgress: 30,
        unlockedAt: habits.some(h => h.currentStreak >= 30) ? new Date() : null,
        xpReward: 75,
        workNeeded: 'Complete the same habit for 30 consecutive days'
      },
      {
        id: 'century-club',
        name: 'Century Club',
        description: 'The legendary 100-day streak achievement',
        icon: '💯',
        rarity: 'legendary',
        category: 'streak',
        requirement: 'Maintain 100-day streak',
        progress: Math.max(...habits.map(h => h.currentStreak), 0),
        maxProgress: 100,
        unlockedAt: habits.some(h => h.currentStreak >= 100) ? new Date() : null,
        xpReward: 200,
        workNeeded: 'Complete the same habit for 100 consecutive days - ultimate dedication!'
      },

      // Completion Achievements
      {
        id: 'habit-completionist',
        name: 'Habit Completionist',
        description: 'Complete 100 total habit instances',
        icon: '✅',
        rarity: 'rare',
        category: 'completion',
        requirement: 'Complete 100 habits',
        progress: completions.length,
        maxProgress: 100,
        unlockedAt: completions.length >= 100 ? completions[99].completedAt : null,
        xpReward: 40,
        workNeeded: 'Complete habits 100 times total (across all your habits)'
      },
      {
        id: 'super-completionist',
        name: 'Super Completionist',
        description: 'Complete 500 total habit instances',
        icon: '🎖️',
        rarity: 'epic',
        category: 'completion',
        requirement: 'Complete 500 habits',
        progress: completions.length,
        maxProgress: 500,
        unlockedAt: completions.length >= 500 ? completions[499].completedAt : null,
        xpReward: 80,
        workNeeded: 'Complete habits 500 times total - shows true commitment!'
      },

      // Challenge Achievements
      {
        id: 'challenge-accepted',
        name: 'Challenge Accepted',
        description: 'Complete your first challenge',
        icon: '🎯',
        rarity: 'common',
        category: 'challenge',
        requirement: 'Complete 1 challenge',
        progress: user.challengeParticipations?.filter(p => p.completed).length || 0,
        maxProgress: 1,
        unlockedAt: user.challengeParticipations?.some(p => p.completed) ? new Date() : null,
        xpReward: 30,
        workNeeded: 'Join and complete any challenge from the Challenges tab'
      },
      {
        id: 'challenge-champion',
        name: 'Challenge Champion',
        description: 'Complete 5 different challenges',
        icon: '🏅',
        rarity: 'epic',
        category: 'challenge',
        requirement: 'Complete 5 challenges',
        progress: user.challengeParticipations?.filter(p => p.completed).length || 0,
        maxProgress: 5,
        unlockedAt: (user.challengeParticipations?.filter(p => p.completed).length || 0) >= 5 ? new Date() : null,
        xpReward: 75,
        workNeeded: 'Complete 5 different challenges to prove your versatility'
      }
    ];

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements'
    });
  }
};

// Get available challenges
export const getChallenges = async (req, res) => {
  try {
    // Mock challenges data - in a real app, this would come from a database
    const challenges = [
      {
        id: 'new-habit-challenge',
        name: 'New Habit Challenge',
        description: 'Create and maintain a new habit for 14 days',
        duration: 14,
        rewardXP: 75,
        badgeIcon: '🎯',
        requirements: [
          {
            type: 'streak_length',
            value: 14
          }
        ],
        active: true,
        participants: []
      },
      {
        id: 'perfect-week',
        name: 'Perfect Week',
        description: 'Complete all your habits for 7 consecutive days',
        duration: 7,
        rewardXP: 100,
        badgeIcon: '⭐',
        requirements: [
          {
            type: 'completion_count',
            value: 7
          }
        ],
        active: true,
        participants: []
      },
      {
        id: '7-day-streak-challenge',
        name: '7-Day Streak Challenge',
        description: 'Build a 7-day streak with any habit',
        duration: 7,
        rewardXP: 50,
        badgeIcon: '🔥',
        requirements: [
          {
            type: 'streak_length',
            value: 7
          }
        ],
        active: true,
        participants: []
      }
    ];

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges'
    });
  }
};

// Get user's challenge participations
export const getChallengeParticipations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's challenge participations from user document
    const user = await User.findById(userId).select('challengeParticipations');
    const participations = user?.challengeParticipations || [];

    res.json({
      success: true,
      data: participations
    });
  } catch (error) {
    console.error('Error fetching challenge participations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge participations'
    });
  }
};

// Join a challenge
export const joinChallenge = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const userId = req.user._id;
      const { challengeId } = req.body;

      if (!challengeId) {
        throw new Error('Challenge ID is required');
      }

      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is already participating in this challenge
      const existingParticipation = user.challengeParticipations?.find(
        p => p.challengeId === challengeId && !p.completed
      );

      if (existingParticipation) {
        throw new Error('Already participating in this challenge');
      }

      // Get user's current habits to snapshot at join time
      const userHabits = await Habit.find({ userId, active: true }).session(session);

      // Create new participation
      const participation = {
        challengeId,
        startDate: new Date(),
        endDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // Default 7 days, should be based on challenge
        completed: false,
        progress: 0,
        habitSnapshotAtJoin: userHabits.map(h => ({
          id: h._id,
          name: h.name,
          category: h.category,
          currentStreak: h.currentStreak
        }))
      };

      // Add participation to user
      if (!user.challengeParticipations) {
        user.challengeParticipations = [];
      }
      user.challengeParticipations.push(participation);
      await user.save({ session });

      res.json({
        success: true,
        data: {
          participation,
          message: 'Successfully joined challenge!'
        }
      });
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to join challenge'
    });
  } finally {
    await session.endSession();
  }
};

// Leave a challenge
export const leaveChallenge = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const userId = req.user._id;
      const { challengeId } = req.body;

      if (!challengeId) {
        throw new Error('Challenge ID is required');
      }

      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Find and remove the participation
      const participationIndex = user.challengeParticipations?.findIndex(
        p => p.challengeId === challengeId && !p.completed
      );

      if (participationIndex === -1 || participationIndex === undefined) {
        throw new Error('Not participating in this challenge');
      }

      user.challengeParticipations.splice(participationIndex, 1);
      await user.save({ session });

      res.json({
        success: true,
        data: {
          message: 'Successfully left challenge'
        }
      });
    });
  } catch (error) {
    console.error('Error leaving challenge:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to leave challenge'
    });
  } finally {
    await session.endSession();
  }
};

// Update challenge progress (called when habits are completed)
export const updateChallengeProgress = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const userId = req.user._id;
      const { challengeId, progress } = req.body;

      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Find the participation
      const participation = user.challengeParticipations?.find(
        p => p.challengeId === challengeId && !p.completed
      );

      if (!participation) {
        throw new Error('Not participating in this challenge');
      }

      // Update progress
      participation.progress = Math.min(100, Math.max(0, progress));

      // Check if challenge is completed
      if (participation.progress >= 100) {
        participation.completed = true;
        
        // Award challenge completion XP
        const challengeXP = 50; // This should be based on the challenge
        const xpTransaction = new XPTransaction({
          userId,
          amount: challengeXP,
          source: 'challenge',
          description: `Completed challenge: ${challengeId}`,
          metadata: { challengeId }
        });
        await xpTransaction.save({ session });

        user.totalXP += challengeXP;
        user.level = calculateLevel(user.totalXP);
      }

      await user.save({ session });

      res.json({
        success: true,
        data: {
          participation,
          completed: participation.completed,
          xpEarned: participation.completed ? 50 : 0
        }
      });
    });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update challenge progress'
    });
  } finally {
    await session.endSession();
  }
};