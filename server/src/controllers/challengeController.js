import PersonalChallenge from '../models/PersonalChallenge.js';
import ChallengeParticipation from '../models/ChallengeParticipation.js';
import User from '../models/User.js';
import XPTransaction from '../models/XPTransaction.js';
import mongoose from 'mongoose';

// Get all available challenges with user status
export const getAllChallenges = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all active challenges
    const challenges = await PersonalChallenge.find({ isActive: true }).lean();

    // Get user's active participations
    const activeParticipations = await ChallengeParticipation.find({
      userId,
      status: 'active'
    }).lean();

    // Get user's challenge history
    const completedParticipations = await ChallengeParticipation.find({
      userId,
      status: 'completed'
    }).lean();

    // Map challenges with user status
    const challengesWithStatus = challenges.map(challenge => {
      const activeParticipation = activeParticipations.find(
        p => p.challengeId.toString() === challenge._id.toString()
      );

      const completedCount = completedParticipations.filter(
        p => p.challengeId.toString() === challenge._id.toString()
      ).length;

      const totalXpEarned = completedParticipations
        .filter(p => p.challengeId.toString() === challenge._id.toString())
        .reduce((sum, p) => sum + (p.xpAwarded || 0), 0);

      return {
        ...challenge,
        userStatus: {
          isActive: !!activeParticipation,
          completedCount,
          activeParticipationId: activeParticipation?._id
        },
        userHistory: {
          activeParticipation,
          completedCount,
          totalXpEarned
        }
      };
    });

    res.json(challengesWithStatus);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
};

// Get specific challenge by ID
export const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const challenge = await PersonalChallenge.findById(id).lean();

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Get user's active participation
    const activeParticipation = await ChallengeParticipation.findOne({
      userId,
      challengeId: id,
      status: 'active'
    }).lean();

    // Get user's history for this challenge
    const history = await ChallengeParticipation.find({
      userId,
      challengeId: id
    }).lean();

    const completedCount = history.filter(p => p.status === 'completed').length;
    const totalXpEarned = history
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.xpAwarded || 0), 0);

    const challengeWithStatus = {
      ...challenge,
      userStatus: {
        isActive: !!activeParticipation,
        completedCount,
        activeParticipationId: activeParticipation?._id
      },
      userHistory: {
        activeParticipation,
        completedCount,
        totalXpEarned
      }
    };

    res.json(challengeWithStatus);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge',
      error: error.message
    });
  }
};

// Join a challenge
export const joinChallenge = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { challengeId } = req.params;
    const userId = req.user.id;

    // Validate challenge exists
    const challenge = await PersonalChallenge.findById(challengeId).session(session);
    if (!challenge || !challenge.isActive) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Challenge not found or inactive'
      });
    }

    // Check if user has any active habits
    const Habit = mongoose.model('Habit');
    const userHabits = await Habit.find({ userId, active: true }).session(session);
    
    if (userHabits.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please create habit to join the challenge'
      });
    }

    // Check if user already has an active participation
    const existingParticipation = await ChallengeParticipation.findOne({
      userId,
      challengeId,
      status: 'active'
    }).session(session);

    if (existingParticipation) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'You are already participating in this challenge'
      });
    }

    // Create new participation
    const participation = new ChallengeParticipation({
      userId,
      challengeId,
      status: 'active',
      startDate: new Date(),
      progress: {
        current: 0,
        target: challenge.requirements.target,
        percentage: 0
      },
      xpAwarded: 0
    });

    await participation.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Successfully joined challenge',
      participation
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error joining challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join challenge',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Get user's active participations
export const getActiveParticipations = async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await ChallengeParticipation.find({
      userId,
      status: 'active'
    })
      .populate('challengeId')
      .sort({ createdAt: -1 })
      .lean();

    res.json(participations);
  } catch (error) {
    console.error('Error fetching active participations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active participations',
      error: error.message
    });
  }
};

// Get user's challenge history
export const getChallengeHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await ChallengeParticipation.find({
      userId,
      status: { $in: ['completed', 'abandoned'] }
    })
      .populate('challengeId')
      .sort({ endDate: -1 })
      .lean();

    // Group by challenge
    const historyMap = new Map();

    participations.forEach(p => {
      const challengeId = p.challengeId._id.toString();
      if (!historyMap.has(challengeId)) {
        historyMap.set(challengeId, {
          challenge: p.challengeId,
          completedCount: 0,
          abandonedCount: 0,
          totalXpEarned: 0,
          lastAttempt: p.endDate
        });
      }

      const history = historyMap.get(challengeId);
      if (p.status === 'completed') {
        history.completedCount++;
        history.totalXpEarned += p.xpAwarded || 0;
      } else {
        history.abandonedCount++;
      }

      if (new Date(p.endDate) > new Date(history.lastAttempt)) {
        history.lastAttempt = p.endDate;
      }
    });

    const history = Array.from(historyMap.values());

    res.json(history);
  } catch (error) {
    console.error('Error fetching challenge history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge history',
      error: error.message
    });
  }
};

// Abandon a challenge
export const abandonChallenge = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { participationId } = req.params;
    const userId = req.user.id;

    const participation = await ChallengeParticipation.findOne({
      _id: participationId,
      userId,
      status: 'active'
    }).session(session);

    if (!participation) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Active participation not found'
      });
    }

    participation.status = 'abandoned';
    participation.endDate = new Date();
    await participation.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Challenge abandoned',
      participation
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error abandoning challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to abandon challenge',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Update challenge progress (called when habits are completed)
export const updateChallengeProgress = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { habitCategory, completionDate } = req.body;

    // Get all active participations for this user
    const participations = await ChallengeParticipation.find({
      userId,
      status: 'active'
    })
      .populate('challengeId')
      .session(session);

    const updatedParticipations = [];
    const completedChallenges = [];

    for (const participation of participations) {
      const challenge = participation.challengeId;

      // Check if this habit completion counts for this challenge
      const categoriesMatch = challenge.requirements.habitCategories.length === 0 ||
        challenge.requirements.habitCategories.includes(habitCategory);

      if (!categoriesMatch) continue;

      // Update progress based on challenge type
      if (challenge.requirements.type === 'total_completions') {
        participation.progress.current += 1;
      }
      // For streak and consistency, we'll need more complex logic
      // This is a simplified version

      // Check if challenge is completed
      if (participation.progress.current >= participation.progress.target) {
        participation.status = 'completed';
        participation.endDate = new Date();
        
        // Calculate completion stats
        const daysToComplete = Math.ceil(
          (participation.endDate - participation.startDate) / (1000 * 60 * 60 * 24)
        );
        participation.completionStats = {
          daysToComplete,
          finalScore: participation.progress.current
        };

        // Award XP
        participation.xpAwarded = challenge.xpReward;

        // Update user XP
        const user = await User.findById(userId).session(session);
        user.xp += challenge.xpReward;
        await user.save({ session });

        // Create XP transaction
        const xpTransaction = new XPTransaction({
          userId,
          amount: challenge.xpReward,
          type: 'challenge_completion',
          description: `Completed challenge: ${challenge.title}`,
          metadata: {
            challengeId: challenge._id,
            participationId: participation._id
          }
        });
        await xpTransaction.save({ session });

        completedChallenges.push({
          challenge,
          participation,
          xpAwarded: challenge.xpReward
        });
      }

      await participation.save({ session });
      updatedParticipations.push(participation);
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Challenge progress updated',
      updatedParticipations,
      completedChallenges
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating challenge progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update challenge progress',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};
