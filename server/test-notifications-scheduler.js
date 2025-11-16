import dotenv from 'dotenv';
import mongoose from 'mongoose';
import notificationScheduler from './src/jobs/notificationScheduler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test all notification functions
const testNotifications = async () => {
  console.log('\n🧪 Testing Notification Scheduler\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Habit Reminders
    console.log('\n1️⃣  Testing Habit Reminders...');
    await notificationScheduler.sendHabitReminders();
    console.log('✅ Habit reminders test completed');

    // Test 2: Streak Milestones
    console.log('\n2️⃣  Testing Streak Milestones...');
    await notificationScheduler.checkStreakMilestones();
    console.log('✅ Streak milestones test completed');

    // Test 3: Daily Summary
    console.log('\n3️⃣  Testing Daily Summary...');
    await notificationScheduler.sendDailySummary();
    console.log('✅ Daily summary test completed');

    // Test 4: Weekly Insights
    console.log('\n4️⃣  Testing Weekly Insights...');
    await notificationScheduler.sendWeeklyInsights();
    console.log('✅ Weekly insights test completed');

    // Test 5: Challenge Updates
    console.log('\n5️⃣  Testing Challenge Updates...');
    await notificationScheduler.sendChallengeUpdates();
    console.log('✅ Challenge updates test completed');

    // Test 6: Community Activity
    console.log('\n6️⃣  Testing Community Activity...');
    await notificationScheduler.sendCommunityActivity();
    console.log('✅ Community activity test completed');

    // Test 7: System Update
    console.log('\n7️⃣  Testing System Update...');
    await notificationScheduler.sendSystemUpdate(
      'Test System Update',
      'This is a test system update notification. Please ignore.'
    );
    console.log('✅ System update test completed');

    // Test 8: Tips & Tricks
    console.log('\n8️⃣  Testing Tips & Tricks...');
    await notificationScheduler.sendTipsAndTricks();
    console.log('✅ Tips & tricks test completed');

    console.log('\n' + '='.repeat(50));
    console.log('✅ All notification tests completed successfully!');
    console.log('\n💡 Check your database for created notifications');
    console.log('💡 Check the console logs above for any errors\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
};

// Run tests
const run = async () => {
  await connectDB();
  await testNotifications();
};

run();
