/**
 * Test script for habit frequency improvements
 * Tests daily, weekly, and custom habit completion restrictions
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Habit from './src/models/Habit.js';
import Completion from './src/models/Completion.js';
import { canCompleteHabit } from './src/utils/completionValidation.js';
import { calculateHabitStreak, calculateConsistencyRate } from './src/utils/streakCalculation.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitforge';

// Test user credentials
const TEST_USER = {
  email: 'test@habitfrequency.com',
  password: 'TestPassword123!',
  username: 'frequencytester',
  timezone: 'UTC'
};

let testUser;
let dailyHabit;
let weeklyHabit;
let customHabit;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  if (testUser) {
    await Completion.deleteMany({ userId: testUser._id });
    await Habit.deleteMany({ userId: testUser._id });
    await User.deleteOne({ _id: testUser._id });
  }
  
  console.log('✅ Cleanup complete');
}

async function createTestUser() {
  console.log('\n👤 Creating test user...');
  
  // Remove existing test user
  await User.deleteOne({ email: TEST_USER.email });
  
  testUser = await User.create({
    email: TEST_USER.email,
    password: TEST_USER.password,
    username: TEST_USER.username,
    timezone: TEST_USER.timezone
  });
  
  console.log(`✅ Test user created: ${testUser.username}`);
  return testUser;
}

async function createTestHabits() {
  console.log('\n📝 Creating test habits...');
  
  // Daily habit
  dailyHabit = await Habit.create({
    userId: testUser._id,
    name: 'Daily Meditation',
    description: 'Meditate for 10 minutes',
    frequency: 'daily',
    category: 'mindfulness',
    color: '#8B5CF6',
    icon: '🧘',
    targetValue: 1,
    unit: 'times'
  });
  console.log(`✅ Daily habit created: ${dailyHabit.name}`);
  
  // Weekly habit
  weeklyHabit = await Habit.create({
    userId: testUser._id,
    name: 'Weekly Review',
    description: 'Review goals and progress',
    frequency: 'weekly',
    category: 'productivity',
    color: '#3B82F6',
    icon: '📊',
    targetValue: 1,
    unit: 'times'
  });
  console.log(`✅ Weekly habit created: ${weeklyHabit.name}`);
  
  // Custom habit (Mon, Wed, Fri)
  customHabit = await Habit.create({
    userId: testUser._id,
    name: 'Gym Workout',
    description: 'Strength training',
    frequency: 'custom',
    category: 'health',
    color: '#EF4444',
    icon: '💪',
    targetValue: 1,
    unit: 'times',
    customFrequency: {
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
      timesPerWeek: 3
    }
  });
  console.log(`✅ Custom habit created: ${customHabit.name} (Mon, Wed, Fri)`);
}

async function testDailyHabit() {
  console.log('\n🧪 Testing Daily Habit Restrictions...');
  
  const today = new Date();
  
  // Test 1: Should be able to complete today
  console.log('\n  Test 1: First completion today');
  let validation = await canCompleteHabit(dailyHabit, testUser._id, today, 'UTC');
  console.log(`  Can complete: ${validation.canComplete}`);
  console.log(`  Reason: ${validation.reason || 'N/A'}`);
  
  if (validation.canComplete) {
    await Completion.create({
      userId: testUser._id,
      habitId: dailyHabit._id,
      completedAt: today,
      value: 1
    });
    console.log('  ✅ Completion created');
  }
  
  // Test 2: Should NOT be able to complete again today
  console.log('\n  Test 2: Second completion attempt today');
  validation = await canCompleteHabit(dailyHabit, testUser._id, today, 'UTC');
  console.log(`  Can complete: ${validation.canComplete}`);
  console.log(`  Reason: ${validation.reason || 'N/A'}`);
  
  if (!validation.canComplete) {
    console.log('  ✅ Correctly prevented duplicate completion');
  } else {
    console.log('  ❌ ERROR: Should have prevented duplicate completion');
  }
  
  // Test 3: Should be able to complete tomorrow
  console.log('\n  Test 3: Completion tomorrow');
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  validation = await canCompleteHabit(dailyHabit, testUser._id, tomorrow, 'UTC');
  console.log(`  Can complete: ${validation.canComplete}`);
  console.log(`  Reason: ${validation.reason || 'N/A'}`);
  
  if (validation.canComplete) {
    console.log('  ✅ Can complete on next day');
  }
}

async function testWeeklyHabit() {
  console.log('\n🧪 Testing Weekly Habit Restrictions...');
  
  const today = new Date();
  
  // Test 1: Should be able to complete this week
  console.log('\n  Test 1: First completion this week');
  let validation = await canCompleteHabit(weeklyHabit, testUser._id, today, 'UTC');
  console.log(`  Can complete: ${validation.canComplete}`);
  console.log(`  Reason: ${validation.reason || 'N/A'}`);
  
  if (validation.canComplete) {
    await Completion.create({
      userId: testUser._id,
      habitId: weeklyHabit._id,
      completedAt: today,
      value: 1
    });
    console.log('  ✅ Completion created');
  }
  
  // Test 2: Should NOT be able to complete again this week
  console.log('\n  Test 2: Second completion attempt this week');
  validation = await canCompleteHabit(weeklyHabit, testUser._id, today, 'UTC');
  console.log(`  Can complete: ${validation.canComplete}`);
  console.log(`  Reason: ${validation.reason || 'N/A'}`);
  
  if (!validation.canComplete) {
    console.log('  ✅ Correctly prevented duplicate completion this week');
  } else {
    console.log('  ❌ ERROR: Should have prevented duplicate completion');
  }
  
  // Test 3: Should be able to complete next week
  console.log('\n  Test 3: Completion next week');
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  validation = await canCompleteHabit(weeklyHabit, testUser._id, nextWeek, 'UTC');
  console.log(`  Can complete: ${validation.canComplete}`);
  console.log(`  Reason: ${validation.reason || 'N/A'}`);
  
  if (validation.canComplete) {
    console.log('  ✅ Can complete next week');
  }
}

async function testCustomHabit() {
  console.log('\n🧪 Testing Custom Habit Restrictions...');
  
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  console.log(`\n  Today is: ${dayNames[dayOfWeek]} (${dayOfWeek})`);
  console.log(`  Habit scheduled for: Monday (1), Wednesday (3), Friday (5)`);
  
  // Test 1: Check if today is a selected day
  console.log('\n  Test 1: Can complete today?');
  let validation = await canCompleteHabit(customHabit, testUser._id, today, 'UTC');
  console.log(`  Can complete: ${validation.canComplete}`);
  console.log(`  Reason: ${validation.reason || 'N/A'}`);
  
  const isSelectedDay = [1, 3, 5].includes(dayOfWeek);
  
  if (isSelectedDay && validation.canComplete) {
    console.log('  ✅ Correctly allows completion on selected day');
    
    // Create completion
    await Completion.create({
      userId: testUser._id,
      habitId: customHabit._id,
      completedAt: today,
      value: 1
    });
    console.log('  ✅ Completion created');
    
    // Test 2: Should NOT be able to complete again today
    console.log('\n  Test 2: Second completion attempt today');
    validation = await canCompleteHabit(customHabit, testUser._id, today, 'UTC');
    console.log(`  Can complete: ${validation.canComplete}`);
    console.log(`  Reason: ${validation.reason || 'N/A'}`);
    
    if (!validation.canComplete) {
      console.log('  ✅ Correctly prevented duplicate completion');
    }
  } else if (!isSelectedDay && !validation.canComplete) {
    console.log('  ✅ Correctly prevents completion on non-selected day');
  } else {
    console.log('  ❌ ERROR: Validation logic incorrect');
  }
  
  // Test 3: Find next selected day and test
  console.log('\n  Test 3: Next selected day');
  let nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + 1);
  
  // Find next Monday, Wednesday, or Friday
  while (![1, 3, 5].includes(nextDate.getDay())) {
    nextDate.setDate(nextDate.getDate() + 1);
  }
  
  console.log(`  Next selected day: ${dayNames[nextDate.getDay()]} (${nextDate.toDateString()})`);
  validation = await canCompleteHabit(customHabit, testUser._id, nextDate, 'UTC');
  console.log(`  Can complete: ${validation.canComplete}`);
  console.log(`  Reason: ${validation.reason || 'N/A'}`);
  
  if (validation.canComplete) {
    console.log('  ✅ Can complete on next selected day');
  }
}

async function testStreakCalculations() {
  console.log('\n🧪 Testing Streak Calculations...');
  
  // Create some historical completions for testing
  const today = new Date();
  
  // Daily habit: 5 consecutive days
  console.log('\n  Creating 5 consecutive daily completions...');
  for (let i = 4; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    await Completion.create({
      userId: testUser._id,
      habitId: dailyHabit._id,
      completedAt: date,
      value: 1
    });
  }
  
  await dailyHabit.calculateStreak();
  console.log(`  Daily habit streak: ${dailyHabit.currentStreak} days`);
  console.log(`  Longest streak: ${dailyHabit.longestStreak} days`);
  
  if (dailyHabit.currentStreak === 5) {
    console.log('  ✅ Daily streak calculated correctly');
  } else {
    console.log(`  ❌ Expected streak of 5, got ${dailyHabit.currentStreak}`);
  }
  
  // Weekly habit: 3 consecutive weeks
  console.log('\n  Creating 3 consecutive weekly completions...');
  for (let i = 2; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7));
    await Completion.create({
      userId: testUser._id,
      habitId: weeklyHabit._id,
      completedAt: date,
      value: 1
    });
  }
  
  await weeklyHabit.calculateStreak();
  console.log(`  Weekly habit streak: ${weeklyHabit.currentStreak} weeks`);
  console.log(`  Longest streak: ${weeklyHabit.longestStreak} weeks`);
  
  if (weeklyHabit.currentStreak >= 2) {
    console.log('  ✅ Weekly streak calculated correctly');
  } else {
    console.log(`  ❌ Expected streak of at least 2, got ${weeklyHabit.currentStreak}`);
  }
}

async function testConsistencyCalculations() {
  console.log('\n🧪 Testing Consistency Rate Calculations...');
  
  // Get completions for each habit
  const dailyCompletions = await Completion.find({ habitId: dailyHabit._id });
  const weeklyCompletions = await Completion.find({ habitId: weeklyHabit._id });
  const customCompletions = await Completion.find({ habitId: customHabit._id });
  
  // Calculate consistency rates
  const dailyConsistency = calculateConsistencyRate(dailyHabit, dailyCompletions, 30, 'UTC');
  const weeklyConsistency = calculateConsistencyRate(weeklyHabit, weeklyCompletions, 30, 'UTC');
  const customConsistency = calculateConsistencyRate(customHabit, customCompletions, 30, 'UTC');
  
  console.log(`\n  Daily habit consistency: ${dailyConsistency}%`);
  console.log(`  Weekly habit consistency: ${weeklyConsistency}%`);
  console.log(`  Custom habit consistency: ${customConsistency}%`);
  
  console.log('\n  ✅ Consistency calculations completed');
}

async function runTests() {
  try {
    await connectDB();
    
    console.log('\n🚀 Starting Habit Frequency Tests\n');
    console.log('='.repeat(50));
    
    await createTestUser();
    await createTestHabits();
    
    await testDailyHabit();
    await testWeeklyHabit();
    await testCustomHabit();
    await testStreakCalculations();
    await testConsistencyCalculations();
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await cleanup();
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run tests
runTests();
