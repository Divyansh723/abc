import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import PersonalChallenge from '../models/PersonalChallenge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '../../.env') });

const challenges = [
  {
    title: '7-Day Streak Master',
    description: 'Build momentum by completing any habit for 7 consecutive days. Consistency is key to forming lasting habits!',
    icon: '🔥',
    difficulty: 'easy',
    duration: 7,
    requirements: {
      type: 'streak',
      target: 7,
      habitCategories: [] // Any category
    },
    xpReward: 150,
    isActive: true,
    isOngoing: true
  },
  {
    title: 'Century Club',
    description: 'Complete 100 total habit check-ins across all your habits. Every completion counts towards your goal!',
    icon: '💯',
    difficulty: 'medium',
    duration: 30,
    requirements: {
      type: 'total_completions',
      target: 100,
      habitCategories: [] // Any category
    },
    xpReward: 300,
    isActive: true,
    isOngoing: true
  },
  {
    title: 'Health Hero',
    description: 'Focus on your wellbeing by completing 50 health-related habits. Exercise, nutrition, and sleep all count!',
    icon: '💪',
    difficulty: 'medium',
    duration: 30,
    requirements: {
      type: 'total_completions',
      target: 50,
      habitCategories: ['health', 'fitness', 'nutrition', 'sleep']
    },
    xpReward: 250,
    isActive: true,
    isOngoing: true
  },
  {
    title: 'Mindful Month',
    description: 'Dedicate 30 days to mindfulness and personal growth. Complete meditation, journaling, or learning habits.',
    icon: '🧘',
    difficulty: 'hard',
    duration: 30,
    requirements: {
      type: 'consistency',
      target: 25, // Complete at least 25 out of 30 days
      habitCategories: ['mindfulness', 'personal growth', 'learning']
    },
    xpReward: 400,
    isActive: true,
    isOngoing: true
  },
  {
    title: 'Productivity Pro',
    description: 'Boost your productivity by completing 75 work or productivity-related habits. Time to level up your output!',
    icon: '🚀',
    difficulty: 'hard',
    duration: 45,
    requirements: {
      type: 'total_completions',
      target: 75,
      habitCategories: ['productivity', 'work', 'career']
    },
    xpReward: 350,
    isActive: true,
    isOngoing: true
  }
];

async function seedChallenges() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing challenges (optional - comment out if you want to keep existing ones)
    await PersonalChallenge.deleteMany({ isOngoing: true });
    console.log('Cleared existing ongoing challenges');

    // Insert new challenges
    const result = await PersonalChallenge.insertMany(challenges);
    console.log(`Successfully seeded ${result.length} challenges:`);
    result.forEach(challenge => {
      console.log(`  - ${challenge.icon} ${challenge.title} (${challenge.difficulty})`);
    });

    console.log('\n✅ Challenge seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding challenges:', error);
    process.exit(1);
  }
}

seedChallenges();
