const mongoose = require('mongoose');
require('dotenv').config();

// Import models
require('./src/models/User');
require('./src/models/Habit');
require('./src/models/Completion');
require('./src/models/PersonalChallenge');
require('./src/models/ChallengeParticipation');

async function testChallengeProgress() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const ChallengeParticipation = mongoose.model('ChallengeParticipation');
    const PersonalChallenge = mongoose.model('PersonalChallenge');
    const Habit = mongoose.model('Habit');
    const Completion = mongoose.model('Completion');
    const User = mongoose.model('User');

    // Find all users with active challenge participations
    const activeParticipations = await ChallengeParticipation.find({
      status: 'active'
    }).populate('challengeId');

    console.log(`\nFound ${activeParticipations.length} active participations\n`);

    for (const participation of activeParticipations) {
      const user = await User.findById(participation.userId);
      const challenge = participation.challengeId;

      console.log(`--- User: ${user.name} ---`);
      console.log(`Challenge: ${challenge.title}`);
      console.log(`Type: ${challenge.requirements.type}`);
      console.log(`Current Progress: ${participation.progress.current}/${participation.progress.target}`);
      console.log(`Started: ${participation.startDate}`);

      // Get user's habits and their streaks
      const userHabits = await Habit.find({ userId: participation.userId });
      console.log(`\nUser has ${userHabits.length} habits:`);
      for (const habit of userHabits) {
        console.log(`  - ${habit.name}: streak ${habit.currentStreak}, total completions ${habit.totalCompletions}`);
      }

      // Get completions since challenge start
      const completionsSinceStart = await Completion.countDocuments({
        userId: participation.userId,
        completedAt: { $gte: participation.startDate }
      });
      console.log(`\nCompletions since challenge start: ${completionsSinceStart}`);

      // Calculate what the progress should be
      if (challenge.requirements.type === 'streak') {
        const maxStreak = Math.max(...userHabits.map(h => h.currentStreak || 0));
        console.log(`Max streak should be: ${maxStreak}`);
        console.log(`Progress should show: ${maxStreak}/${participation.progress.target}`);
      }
      console.log('\n' + '='.repeat(50) + '\n');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testChallengeProgress();
