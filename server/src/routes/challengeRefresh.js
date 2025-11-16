import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Refresh personal challenge progress for a user
router.post('/refresh-progress', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const userId = req.user._id;
      
      const ChallengeParticipation = mongoose.model('ChallengeParticipation');
      const PersonalChallenge = mongoose.model('PersonalChallenge');
      const Habit = mongoose.model('Habit');
      const Completion = mongoose.model('Completion');
      
      const activeParticipations = await ChallengeParticipation.find({
        userId,
        status: 'active'
      }).session(session);

      console.log(`Found ${activeParticipations.length} active participations for user ${userId}`);

      for (const participation of activeParticipations) {
        const challenge = await PersonalChallenge.findById(participation.challengeId).session(session);
        if (!challenge) {
          console.log(`Challenge ${participation.challengeId} not found`);
          continue;
        }

        console.log(`Processing challenge: ${challenge.title} (${challenge.requirements.type})`);

        // Update progress based on challenge type
        if (challenge.requirements.type === 'streak') {
          // For streak challenges, find the maximum streak among all user's habits
          const allUserHabits = await Habit.find({ userId }).session(session);
          const maxStreak = Math.max(...allUserHabits.map(h => h.currentStreak || 0));
          participation.progress.current = maxStreak;
          console.log(`Streak challenge: max streak = ${maxStreak}, target = ${participation.progress.target}`);
        } else if (challenge.requirements.type === 'total_completions') {
          // For completion challenges, count total completions since challenge start
          const completionsSinceStart = await Completion.countDocuments({
            userId,
            completedAt: { $gte: participation.startDate }
          }).session(session);
          participation.progress.current = completionsSinceStart;
          console.log(`Completion challenge: completions = ${completionsSinceStart}, target = ${participation.progress.target}`);
        } else if (challenge.requirements.type === 'consistency') {
          // For consistency challenges, calculate consistency percentage
          const daysSinceStart = Math.ceil((new Date() - participation.startDate) / (1000 * 60 * 60 * 24));
          const completionsSinceStart = await Completion.countDocuments({
            userId,
            completedAt: { $gte: participation.startDate }
          }).session(session);
          participation.progress.current = Math.round((completionsSinceStart / daysSinceStart) * 100);
          console.log(`Consistency challenge: ${completionsSinceStart}/${daysSinceStart} days = ${participation.progress.current}%, target = ${participation.progress.target}%`);
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
          const User = mongoose.model('User');
          const user = await User.findById(userId).session(session);
          user.totalXP += challenge.xpReward;
          await user.save({ session });

          console.log(`Challenge completed! Awarded ${challenge.xpReward} XP`);
        }

        await participation.save({ session });
      }
    });

    res.json({ 
      success: true, 
      message: 'Challenge progress refreshed successfully' 
    });
  } catch (error) {
    console.error('Error refreshing challenge progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to refresh challenge progress',
      error: error.message 
    });
  } finally {
    await session.endSession();
  }
});

export default router;
