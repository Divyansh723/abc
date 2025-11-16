import { Habit, Completion } from '../models/index.js';
import XPTransaction from '../models/XPTransaction.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { canCompleteHabit } from '../utils/completionValidation.js';

// Get all habits for the authenticated user
export const getHabits = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, active, archived } = req.query;

    // Build query
    const query = { userId };
    
    if (category) query.category = category;
    if (active !== undefined) query.active = active === 'true';
    if (archived !== undefined) query.archived = archived === 'true';

    const habits = await Habit.find(query)
      .sort({ createdAt: -1 })
      .populate('completions', null, null, { 
        sort: { completedAt: -1 },
        limit: 30 // Last 30 completions
      });

    res.json({
      success: true,
      data: {
        habits: habits.map(habit => habit.toJSON())
      }
    });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching habits'
    });
  }
};

// Get a specific habit
export const getHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user._id;

    const habit = await Habit.findOne({ _id: habitId, userId })
      .populate('completions', null, null, { 
        sort: { completedAt: -1 },
        limit: 100 
      });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    res.json({
      success: true,
      data: {
        habit: habit.toJSON()
      }
    });
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching habit'
    });
  }
};

// Create a new habit
export const createHabit = async (req, res) => {
  try {
    const userId = req.user._id;
    const habitData = {
      ...req.body,
      userId
    };

    const habit = new Habit(habitData);
    await habit.save();

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: {
        habit: habit.toJSON()
      }
    });
  } catch (error) {
    console.error('Create habit error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating habit'
    });
  }
};

// Update a habit
export const updateHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.userId;
    delete updates.createdAt;
    delete updates.totalCompletions;
    delete updates.currentStreak;
    delete updates.longestStreak;

    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    res.json({
      success: true,
      message: 'Habit updated successfully',
      data: {
        habit: habit.toJSON()
      }
    });
  } catch (error) {
    console.error('Update habit error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating habit'
    });
  }
};

// Delete a habit
export const deleteHabit = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { habitId } = req.params;
      const userId = req.user._id;

      const habit = await Habit.findOne({ _id: habitId, userId }).session(session);

      if (!habit) {
        throw new Error('Habit not found');
      }

      // Check if this is a challenge/community habit (exception - no XP refund)
      const isChallengeHabit = habit.isChallengeHabit || false;

      // Calculate days since habit creation
      const createdDate = new Date(habit.createdAt);
      const currentDate = new Date();
      const daysSinceCreation = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));

      // If habit is less than 5 days old and NOT a challenge habit, refund XP
      let xpRefunded = 0;
      if (daysSinceCreation < 5 && !isChallengeHabit) {
        // Get all completions for this habit
        const completions = await Completion.find({ habitId }).session(session);
        
        // Calculate total XP earned from this habit
        xpRefunded = completions.reduce((total, completion) => {
          return total + (completion.xpEarned || 0);
        }, 0);

        if (xpRefunded > 0) {
          // Deduct XP from user
          const user = await User.findById(userId).session(session);
          if (user) {
            user.totalXP = Math.max(0, user.totalXP - xpRefunded);
            await user.save({ session });

            // Create negative XP transaction for audit trail
            const xpTransaction = new XPTransaction({
              userId,
              amount: -xpRefunded,
              source: 'habit_deletion_refund',
              description: `XP refunded for deleting habit "${habit.name}" within 5 days`,
              metadata: {
                habitId: habit._id,
                habitName: habit.name,
                daysSinceCreation,
                completionsCount: completions.length
              }
            });
            await xpTransaction.save({ session });
          }
        }
      }

      // Delete all completions for this habit
      await Completion.deleteMany({ habitId }).session(session);

      // Delete the habit
      await Habit.findByIdAndDelete(habitId).session(session);

      res.json({
        success: true,
        message: 'Habit deleted successfully',
        data: {
          xpRefunded,
          refundApplied: xpRefunded > 0,
          reason: xpRefunded > 0 
            ? `Refunded ${xpRefunded} XP (habit deleted within 5 days)` 
            : isChallengeHabit 
            ? 'No refund for challenge habits'
            : daysSinceCreation >= 5
            ? 'No refund (habit older than 5 days)'
            : 'No XP to refund'
        }
      });
    });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while deleting habit'
    });
  } finally {
    session.endSession();
  }
};

// Archive a habit
export const archiveHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user._id;

    const habit = await Habit.findOne({ _id: habitId, userId });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    await habit.archive();

    res.json({
      success: true,
      message: 'Habit archived successfully',
      data: {
        habit: habit.toJSON()
      }
    });
  } catch (error) {
    console.error('Archive habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while archiving habit'
    });
  }
};

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

// Mark habit as complete
export const markComplete = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { habitId } = req.params;
      const userId = req.user._id;
      const { date, timezone, notes, mood, difficulty, duration } = req.body;

      // Verify habit exists and belongs to user
      const habit = await Habit.findOne({ _id: habitId, userId }).session(session);
      if (!habit) {
        throw new Error('Habit not found');
      }

      // Always use UTC time for database storage to ensure consistency
      const completionDate = date ? new Date(date) : new Date();
      const userTimezone = timezone || req.user.timezone || 'UTC';

      // Validate if habit can be completed based on frequency rules
      const validation = await canCompleteHabit(habit, userId, completionDate, userTimezone);
      if (!validation.canComplete) {
        throw new Error(validation.reason);
      }

      // Check if already completed on this date
      const startOfDay = new Date(completionDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(completionDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingCompletion = await Completion.findOne({
        habitId,
        userId,
        completedAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).session(session);

      if (existingCompletion) {
        throw new Error('Habit already completed for this date');
      }

      // Update total completions count
      habit.totalCompletions += 1;

      // Create completion FIRST so it's available for streak calculation
      const completion = new Completion({
        habitId,
        userId,
        completedAt: completionDate,
        deviceTimezone: userTimezone,
        xpEarned: 0, // Will be updated after streak calculation
        notes,
        mood,
        difficulty,
        duration
      });
      await completion.save({ session });

      // NOW calculate streak with the new completion included
      // Pass session so it can see the completion we just saved
      await habit.calculateStreak(session);
      
      // Calculate consistency rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentCompletions = await Completion.countDocuments({
        habitId,
        userId,
        completedAt: { $gte: thirtyDaysAgo }
      }).session(session);
      
      habit.consistencyRate = Math.round((recentCompletions / 30) * 100);

      // Calculate XP with bonuses using the updated streak
      let baseXP = 10;
      let streakBonus = 0;
      let multiplier = 1;

      // Streak bonuses based on current streak
      if (habit.currentStreak >= 7) streakBonus += 5;
      if (habit.currentStreak >= 30) streakBonus += 10;
      if (habit.currentStreak >= 100) streakBonus += 20;

      // First completion bonus
      if (habit.totalCompletions === 1) {
        multiplier = 1.5;
      }

      // Difficulty multiplier
      if (difficulty) {
        multiplier *= (difficulty / 3); // Scale difficulty 1-5 to 0.33-1.67
      }

      const totalXP = Math.round((baseXP + streakBonus) * multiplier);

      // Update completion with calculated XP
      completion.xpEarned = totalXP;
      await completion.save({ session });

      // Save habit with updated stats
      await habit.save({ session });

      // Create XP transaction
      const xpTransaction = new XPTransaction({
        userId,
        habitId,
        amount: totalXP,
        source: 'habit_completion',
        description: `Completed ${habit.name}`,
        metadata: {
          streakLength: habit.currentStreak,
          multiplier,
          baseXP,
          streakBonus
        }
      });
      await xpTransaction.save({ session });

      // Update user's XP and level
      const user = await User.findById(userId).session(session);
      const oldLevel = calculateLevel(user.totalXP);
      user.totalXP += totalXP;
      const newLevel = calculateLevel(user.totalXP);
      user.level = newLevel;

      // Award level up bonus if leveled up
      let levelUpBonus = 0;
      if (newLevel > oldLevel) {
        levelUpBonus = newLevel * 10;
        user.totalXP += levelUpBonus;
        
        const levelUpTransaction = new XPTransaction({
          userId,
          amount: levelUpBonus,
          source: 'level_bonus',
          description: `Level ${newLevel} bonus`,
          metadata: { newLevel, oldLevel }
        });
        await levelUpTransaction.save({ session });
      }

      await user.save({ session });

      // Update personal challenge progress
      const ChallengeParticipation = mongoose.model('ChallengeParticipation');
      const PersonalChallenge = mongoose.model('PersonalChallenge');
      
      const activeParticipations = await ChallengeParticipation.find({
        userId,
        status: 'active'
      }).session(session);

      for (const participation of activeParticipations) {
        const challenge = await PersonalChallenge.findById(participation.challengeId).session(session);
        if (!challenge) continue;

        // Update progress based on challenge type
        if (challenge.requirements.type === 'streak') {
          // For streak challenges, find the maximum streak among ALL user's habits
          const allUserHabits = await Habit.find({ userId }).session(session);
          const maxStreak = Math.max(...allUserHabits.map(h => h.currentStreak || 0));
          participation.progress.current = maxStreak;
        } else if (challenge.requirements.type === 'total_completions') {
          // For completion challenges, count total completions since challenge start
          const completionsSinceStart = await Completion.countDocuments({
            userId,
            completedAt: { $gte: participation.startDate }
          }).session(session);
          participation.progress.current = completionsSinceStart;
        } else if (challenge.requirements.type === 'consistency') {
          // For consistency challenges, calculate consistency percentage
          const daysSinceStart = Math.ceil((new Date() - participation.startDate) / (1000 * 60 * 60 * 24));
          const completionsSinceStart = await Completion.countDocuments({
            userId,
            completedAt: { $gte: participation.startDate }
          }).session(session);
          participation.progress.current = Math.round((completionsSinceStart / daysSinceStart) * 100);
        } else if (challenge.requirements.type === 'perfect_days') {
          // For perfect day challenges, count days where ALL relevant habits were completed
          const { calculatePerfectDays } = await import('../utils/habitFiltering.js');
          const perfectDaysCount = await calculatePerfectDays(userId, participation.startDate, new Date(), session);
          participation.progress.current = perfectDaysCount;
        }

        // Check if challenge is completed
        if (participation.progress.current >= participation.progress.target && participation.status === 'active') {
          participation.status = 'completed';
          participation.endDate = new Date();
          participation.completionStats = {
            daysToComplete: Math.ceil((new Date() - participation.startDate) / (1000 * 60 * 60 * 24)),
            finalScore: participation.progress.current
          };
          participation.xpAwarded = challenge.xpReward;
          
          // Award XP for challenge completion
          user.totalXP += challenge.xpReward;
          await user.save({ session });
        }

        await participation.save({ session });
      }

      // Update challenge progress if this is a challenge habit
      let challengeCompleted = false;
      if (habit.isChallengeHabit && habit.circleId && habit.challengeId) {
        const CommunityCircle = mongoose.model('CommunityCircle');
        const circle = await CommunityCircle.findById(habit.circleId).session(session);
        
        if (circle) {
          const challenge = circle.challenges.id(habit.challengeId);
          if (challenge) {
            const participant = challenge.participants.find(p => 
              p.userId.toString() === userId.toString() && 
              p.habitId && p.habitId.toString() === habitId.toString()
            );
            
            if (participant && !participant.completed) {
              // Update progress based on challenge type
              if (challenge.type === 'completion') {
                participant.progress += 1;
              } else if (challenge.type === 'streak') {
                participant.progress = habit.currentStreak;
              } else if (challenge.type === 'consistency') {
                // Calculate consistency for challenge period
                const challengeStart = new Date(Math.max(challenge.startDate, participant.joinedAt));
                const daysSinceStart = Math.ceil((new Date() - challengeStart) / (1000 * 60 * 60 * 24));
                const completionsInPeriod = await Completion.countDocuments({
                  habitId,
                  userId,
                  completedAt: { $gte: challengeStart }
                }).session(session);
                participant.progress = Math.round((completionsInPeriod / daysSinceStart) * 100);
              }
              
              // Check if challenge is completed
              if (participant.progress >= challenge.target) {
                participant.completed = true;
                participant.completedAt = new Date();
                challengeCompleted = true;
                
                // Award community points
                circle.addCommunityPoints(userId, challenge.pointsReward);
              }
              
              await circle.save({ session });
            }
          }
        }
      }

      res.status(201).json({
        success: true,
        message: 'Habit marked as complete',
        data: {
          completion: completion.toJSON(),
          xpEarned: totalXP,
          levelUpBonus,
          newLevel,
          leveledUp: newLevel > oldLevel,
          newTotalXP: user.totalXP,
          challengeCompleted
        }
      });
    });
  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while marking habit complete'
    });
  } finally {
    await session.endSession();
  }
};

// Use forgiveness token
export const useForgiveness = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user._id;
    const { date, timezone } = req.body;

    // Check if user has forgiveness tokens
    const user = req.user;
    if (user.forgivenessTokens <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No forgiveness tokens available'
      });
    }

    // Verify habit exists and belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    const forgivenessDate = new Date(date);
    const userTimezone = timezone || user.timezone || 'UTC';

    // Check if already completed or forgiven on this date
    const startOfDay = new Date(forgivenessDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(forgivenessDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingCompletion = await Completion.findOne({
      habitId,
      userId,
      completedAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (existingCompletion) {
      return res.status(400).json({
        success: false,
        message: 'Habit already completed or forgiven for this date'
      });
    }

    // Create forgiveness completion
    const completion = new Completion({
      habitId,
      userId,
      completedAt: forgivenessDate,
      deviceTimezone: userTimezone,
      xpEarned: 5, // Less XP for forgiveness
      forgivenessUsed: true,
      editedFlag: true
    });

    await completion.save();

    // Update habit statistics after forgiveness
    habit.totalCompletions += 1;
    await habit.calculateStreak();
    
    // Calculate consistency rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCompletions = await Completion.countDocuments({
      habitId,
      userId,
      completedAt: { $gte: thirtyDaysAgo }
    });
    
    habit.consistencyRate = Math.round((recentCompletions / 30) * 100);
    await habit.save();

    // Decrease user's forgiveness tokens
    user.forgivenessTokens -= 1;
    await user.save();

    res.json({
      success: true,
      message: 'Forgiveness token used successfully',
      data: {
        completion: completion.toJSON(),
        remainingTokens: user.forgivenessTokens
      }
    });
  } catch (error) {
    console.error('Use forgiveness error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while using forgiveness token'
    });
  }
};

// Get habit statistics
export const getHabitStats = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user._id;
    const { period = 'month' } = req.query;

    // Verify habit exists and belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    // Calculate date range based on period
    let days;
    switch (period) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'year':
        days = 365;
        break;
      default:
        days = 30;
    }

    const stats = await Completion.getStats(userId, habitId, days);

    res.json({
      success: true,
      data: {
        stats: {
          totalCompletions: habit.totalCompletions,
          currentStreak: habit.currentStreak,
          longestStreak: habit.longestStreak,
          consistencyRate: habit.consistencyRate,
          averageXPPerDay: stats.averageXPPerDay || 0,
          totalActiveDays: Math.round(habit.totalCompletions * 1.2),
          periodStats: stats
        }
      }
    });
  } catch (error) {
    console.error('Get habit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching habit statistics'
    });
  }
};

// Get habit completions
export const getHabitCompletions = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user._id;
    const { days = 30, page = 1, limit = 50 } = req.query;

    // Verify habit exists and belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const completions = await Completion.find({
      habitId,
      userId,
      completedAt: { $gte: startDate }
    })
    .sort({ completedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Completion.countDocuments({
      habitId,
      userId,
      completedAt: { $gte: startDate }
    });

    res.json({
      success: true,
      data: {
        completions: completions.map(completion => completion.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get habit completions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching habit completions'
    });
  }
};

// Get today's completions
export const getTodayCompletions = async (req, res) => {
  try {
    const userId = req.user._id;
    const timezone = req.user.timezone || 'UTC';

    const completions = await Completion.findTodayCompletions(userId, timezone);
    
    // Return just the habit IDs for compatibility with frontend
    const habitIds = completions.map(completion => completion.habitId.toString());

    res.json({
      success: true,
      data: habitIds
    });
  } catch (error) {
    console.error('Get today completions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching today\'s completions'
    });
  }
};

// Recalculate all habit statistics (utility endpoint)
export const recalculateHabitStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const habits = await Habit.find({ userId });
    
    for (const habit of habits) {
      await habit.recalculateStats();
    }

    res.json({
      success: true,
      message: `Recalculated statistics for ${habits.length} habits`,
      data: {
        habitsUpdated: habits.length
      }
    });
  } catch (error) {
    console.error('Recalculate habit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while recalculating habit statistics'
    });
  }
};