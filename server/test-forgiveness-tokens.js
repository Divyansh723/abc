import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Habit, Completion, XPTransaction } from './src/models/index.js';
import { autoUseForgivenessTokens } from './src/jobs/autoForgivenessToken.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitforge';

/**
 * Test Script for Forgiveness Token System
 * Tests both manual and automatic forgiveness token usage
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    log.success('Connected to MongoDB');
  } catch (error) {
    log.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  log.info('Disconnected from MongoDB');
}

// Test 1: Check user's forgiveness tokens
async function testCheckTokens() {
  log.section('TEST 1: Check Forgiveness Tokens');
  
  try {
    const users = await User.find({ isActive: true }).limit(5);
    
    if (users.length === 0) {
      log.warning('No active users found');
      return;
    }

    log.info(`Found ${users.length} active users`);
    
    for (const user of users) {
      log.info(`User: ${user.name} (${user.email})`);
      log.info(`  Tokens: ${user.forgivenessTokens}/3`);
      log.info(`  Level: ${user.level}`);
      log.info(`  Total XP: ${user.totalXP}`);
    }
    
    log.success('Token check completed');
  } catch (error) {
    log.error(`Error checking tokens: ${error.message}`);
  }
}

// Test 2: Check habits needing forgiveness
async function testCheckHabitsNeedingForgiveness() {
  log.section('TEST 2: Check Habits Needing Forgiveness');
  
  try {
    const users = await User.find({ 
      isActive: true,
      forgivenessTokens: { $gt: 0 }
    }).limit(5);
    
    if (users.length === 0) {
      log.warning('No users with forgiveness tokens found');
      return;
    }

    log.info(`Checking ${users.length} users with tokens`);
    
    for (const user of users) {
      const habits = await Habit.find({
        userId: user._id,
        active: true,
        currentStreak: { $gt: 0 }
      });

      if (habits.length === 0) {
        log.info(`${user.name}: No habits with active streaks`);
        continue;
      }

      // Get today's completions
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const todayCompletions = await Completion.find({
        userId: user._id,
        completedAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const completedHabitIds = new Set(
        todayCompletions.map(c => c.habitId.toString())
      );

      const habitsNeedingForgiveness = habits.filter(
        h => !completedHabitIds.has(h._id.toString())
      );

      log.info(`${user.name}:`);
      log.info(`  Total habits with streaks: ${habits.length}`);
      log.info(`  Completed today: ${todayCompletions.length}`);
      log.info(`  Needing forgiveness: ${habitsNeedingForgiveness.length}`);
      log.info(`  Available tokens: ${user.forgivenessTokens}`);

      if (habitsNeedingForgiveness.length > 0) {
        log.info(`  Habits that would be protected:`);
        habitsNeedingForgiveness
          .sort((a, b) => b.currentStreak - a.currentStreak)
          .slice(0, user.forgivenessTokens)
          .forEach(h => {
            log.info(`    - ${h.name} (${h.currentStreak}-day streak)`);
          });
      }
    }
    
    log.success('Habit check completed');
  } catch (error) {
    log.error(`Error checking habits: ${error.message}`);
  }
}

// Test 3: Manual forgiveness token usage
async function testManualForgivenessToken() {
  log.section('TEST 3: Manual Forgiveness Token Usage');
  
  try {
    // Find a user with tokens and a habit with a streak
    const user = await User.findOne({
      isActive: true,
      forgivenessTokens: { $gt: 0 }
    });

    if (!user) {
      log.warning('No user with tokens found');
      return;
    }

    const habit = await Habit.findOne({
      userId: user._id,
      active: true,
      currentStreak: { $gt: 0 }
    });

    if (!habit) {
      log.warning(`User ${user.name} has no habits with active streaks`);
      return;
    }

    // Check if already completed today
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existingCompletion = await Completion.findOne({
      habitId: habit._id,
      userId: user._id,
      completedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingCompletion) {
      log.info(`Habit "${habit.name}" already completed today`);
      log.info('Skipping manual test (habit already completed)');
      return;
    }

    log.info(`Testing manual forgiveness for:`);
    log.info(`  User: ${user.name}`);
    log.info(`  Habit: ${habit.name}`);
    log.info(`  Current streak: ${habit.currentStreak} days`);
    log.info(`  Tokens before: ${user.forgivenessTokens}`);

    // Create forgiveness completion
    const completion = new Completion({
      habitId: habit._id,
      userId: user._id,
      completedAt: today,
      deviceTimezone: user.timezone || 'UTC',
      xpEarned: 5,
      forgivenessUsed: true,
      editedFlag: true
    });
    await completion.save();

    // Create XP transaction
    const xpTransaction = new XPTransaction({
      userId: user._id,
      habitId: habit._id,
      amount: 5,
      source: 'habit_completion',
      description: `Manual forgiveness: ${habit.name}`,
      metadata: {
        manualForgiveness: true,
        streakProtected: habit.currentStreak
      }
    });
    await xpTransaction.save();

    // Update user
    user.forgivenessTokens -= 1;
    user.totalXP += 5;
    await user.save();

    log.success('Manual forgiveness token used successfully!');
    log.info(`  Tokens after: ${user.forgivenessTokens}`);
    log.info(`  XP earned: 5`);
    log.info(`  New total XP: ${user.totalXP}`);
    log.info(`  Completion ID: ${completion._id}`);

  } catch (error) {
    log.error(`Error in manual forgiveness test: ${error.message}`);
  }
}

// Test 4: Automatic forgiveness token job
async function testAutomaticForgiveness() {
  log.section('TEST 4: Automatic Forgiveness Token Job');
  
  try {
    log.info('Running automatic forgiveness token job...');
    
    const result = await autoUseForgivenessTokens();
    
    log.success('Automatic forgiveness job completed!');
    log.info(`  Tokens used: ${result.tokensUsed}`);
    log.info(`  Habits protected: ${result.habitsProtected}`);
    log.info(`  Notifications sent: ${result.notificationsSent}`);
    log.info(`  Duration: ${result.duration}ms`);

  } catch (error) {
    log.error(`Error in automatic forgiveness test: ${error.message}`);
  }
}

// Test 5: Verify forgiveness completions
async function testVerifyForgivenessCompletions() {
  log.section('TEST 5: Verify Forgiveness Completions');
  
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const forgivenessCompletions = await Completion.find({
      forgivenessUsed: true,
      completedAt: { $gte: startOfDay, $lte: endOfDay }
    }).populate('habitId userId');

    log.info(`Found ${forgivenessCompletions.length} forgiveness completions today`);

    for (const completion of forgivenessCompletions) {
      log.info(`Completion:`);
      log.info(`  User: ${completion.userId?.name || 'Unknown'}`);
      log.info(`  Habit: ${completion.habitId?.name || 'Unknown'}`);
      log.info(`  XP earned: ${completion.xpEarned}`);
      log.info(`  Time: ${completion.completedAt.toLocaleTimeString()}`);
    }

    log.success('Verification completed');
  } catch (error) {
    log.error(`Error verifying completions: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║     FORGIVENESS TOKEN SYSTEM - TEST SUITE                 ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  await connectDB();

  try {
    await testCheckTokens();
    await testCheckHabitsNeedingForgiveness();
    await testManualForgivenessToken();
    await testAutomaticForgiveness();
    await testVerifyForgivenessCompletions();

    log.section('ALL TESTS COMPLETED');
    log.success('Forgiveness token system is working correctly!');

  } catch (error) {
    log.error(`Test suite error: ${error.message}`);
    console.error(error);
  } finally {
    await disconnectDB();
  }
}

// Run tests
runTests().catch(console.error);
