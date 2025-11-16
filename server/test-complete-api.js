/**
 * HabitForge - Comprehensive API Test Suite
 * Tests all backend API endpoints
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';
let authToken = '';
let testUserId = '';
let testHabitId = '';
let testCircleId = '';
let testChallengeId = '';

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, passed, error = null) {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
    if (error) console.log(`   Error: ${error.message}`);
  }
  results.tests.push({ name, passed, error: error?.message });
}

// Helper function for API calls
async function apiCall(method, endpoint, data = null, useAuth = true) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: useAuth && authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
  };
  if (data) config.data = data;
  return axios(config);
}

// ============================================
// 1. AUTHENTICATION TESTS
// ============================================
async function testAuthentication() {
  console.log('\n📝 Testing Authentication...\n');

  // Test 1.1: Register new user
  try {
    const response = await apiCall('post', '/auth/register', {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    }, false);
    authToken = response.data.token;
    testUserId = response.data.user.id;
    logTest('Register new user', response.status === 201);
  } catch (error) {
    logTest('Register new user', false, error);
  }

  // Test 1.2: Login with valid credentials
  try {
    const response = await apiCall('post', '/auth/login', {
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    }, false);
    logTest('Login with valid credentials', response.status === 200);
  } catch (error) {
    logTest('Login with valid credentials', false, error);
  }

  // Test 1.3: Get current user
  try {
    const response = await apiCall('get', '/auth/me');
    logTest('Get current user', response.status === 200 && response.data.user);
  } catch (error) {
    logTest('Get current user', false, error);
  }
}

// ============================================
// 2. HABIT MANAGEMENT TESTS
// ============================================
async function testHabits() {
  console.log('\n📝 Testing Habit Management...\n');

  // Test 2.1: Create habit
  try {
    const response = await apiCall('post', '/habits', {
      name: 'Test Habit',
      description: 'Test Description',
      frequency: 'daily',
      category: 'health',
      icon: '🏃',
      color: '#3b82f6'
    });
    testHabitId = response.data.habit.id;
    logTest('Create habit', response.status === 201);
  } catch (error) {
    logTest('Create habit', false, error);
  }

  // Test 2.2: Get all habits
  try {
    const response = await apiCall('get', '/habits');
    logTest('Get all habits', response.status === 200 && Array.isArray(response.data.habits));
  } catch (error) {
    logTest('Get all habits', false, error);
  }

  // Test 2.3: Get habit by ID
  try {
    const response = await apiCall('get', `/habits/${testHabitId}`);
    logTest('Get habit by ID', response.status === 200);
  } catch (error) {
    logTest('Get habit by ID', false, error);
  }

  // Test 2.4: Update habit
  try {
    const response = await apiCall('put', `/habits/${testHabitId}`, {
      name: 'Updated Test Habit'
    });
    logTest('Update habit', response.status === 200);
  } catch (error) {
    logTest('Update habit', false, error);
  }

  // Test 2.5: Complete habit
  try {
    const response = await apiCall('post', `/habits/${testHabitId}/complete`);
    logTest('Complete habit', response.status === 200);
  } catch (error) {
    logTest('Complete habit', false, error);
  }

  // Test 2.6: Get habit completions
  try {
    const response = await apiCall('get', `/habits/${testHabitId}/completions`);
    logTest('Get habit completions', response.status === 200);
  } catch (error) {
    logTest('Get habit completions', false, error);
  }
}

// ============================================
// 3. GAMIFICATION TESTS
// ============================================
async function testGamification() {
  console.log('\n📝 Testing Gamification...\n');

  // Test 3.1: Get user stats
  try {
    const response = await apiCall('get', '/gamification/stats');
    logTest('Get user stats', response.status === 200);
  } catch (error) {
    logTest('Get user stats', false, error);
  }

  // Test 3.2: Get achievements
  try {
    const response = await apiCall('get', '/gamification/achievements');
    logTest('Get achievements', response.status === 200);
  } catch (error) {
    logTest('Get achievements', false, error);
  }

  // Test 3.3: Get leaderboard
  try {
    const response = await apiCall('get', '/gamification/leaderboard');
    logTest('Get leaderboard', response.status === 200);
  } catch (error) {
    logTest('Get leaderboard', false, error);
  }
}

// ============================================
// 4. COMMUNITY TESTS
// ============================================
async function testCommunity() {
  console.log('\n📝 Testing Community Features...\n');

  // Test 4.1: Create circle
  try {
    const response = await apiCall('post', '/community/circles', {
      name: 'Test Circle',
      description: 'Test Description',
      privacy: 'public',
      memberLimit: 50
    });
    testCircleId = response.data.circle.id;
    logTest('Create circle', response.status === 201);
  } catch (error) {
    logTest('Create circle', false, error);
  }

  // Test 4.2: Get all circles
  try {
    const response = await apiCall('get', '/community/circles');
    logTest('Get all circles', response.status === 200);
  } catch (error) {
    logTest('Get all circles', false, error);
  }

  // Test 4.3: Get circle by ID
  try {
    const response = await apiCall('get', `/community/circles/${testCircleId}`);
    logTest('Get circle by ID', response.status === 200);
  } catch (error) {
    logTest('Get circle by ID', false, error);
  }

  // Test 4.4: Join circle
  try {
    const response = await apiCall('post', `/community/circles/${testCircleId}/join`);
    logTest('Join circle', response.status === 200);
  } catch (error) {
    logTest('Join circle', false, error);
  }

  // Test 4.5: Get circle members
  try {
    const response = await apiCall('get', `/community/circles/${testCircleId}/members`);
    logTest('Get circle members', response.status === 200);
  } catch (error) {
    logTest('Get circle members', false, error);
  }
}

// ============================================
// 5. CHALLENGES TESTS
// ============================================
async function testChallenges() {
  console.log('\n📝 Testing Challenges...\n');

  // Test 5.1: Get available challenges
  try {
    const response = await apiCall('get', '/challenges');
    logTest('Get available challenges', response.status === 200);
  } catch (error) {
    logTest('Get available challenges', false, error);
  }

  // Test 5.2: Join challenge
  try {
    const response = await apiCall('get', '/challenges');
    if (response.data.challenges && response.data.challenges.length > 0) {
      testChallengeId = response.data.challenges[0].id;
      const joinResponse = await apiCall('post', `/challenges/${testChallengeId}/join`);
      logTest('Join challenge', joinResponse.status === 200);
    } else {
      logTest('Join challenge', false, new Error('No challenges available'));
    }
  } catch (error) {
    logTest('Join challenge', false, error);
  }

  // Test 5.3: Get user challenges
  try {
    const response = await apiCall('get', '/challenges/my-challenges');
    logTest('Get user challenges', response.status === 200);
  } catch (error) {
    logTest('Get user challenges', false, error);
  }
}

// ============================================
// 6. NOTIFICATIONS TESTS
// ============================================
async function testNotifications() {
  console.log('\n📝 Testing Notifications...\n');

  // Test 6.1: Get notifications
  try {
    const response = await apiCall('get', '/notifications');
    logTest('Get notifications', response.status === 200);
  } catch (error) {
    logTest('Get notifications', false, error);
  }

  // Test 6.2: Get unread count
  try {
    const response = await apiCall('get', '/notifications/unread-count');
    logTest('Get unread count', response.status === 200);
  } catch (error) {
    logTest('Get unread count', false, error);
  }

  // Test 6.3: Get notification preferences
  try {
    const response = await apiCall('get', '/notifications/preferences');
    logTest('Get notification preferences', response.status === 200);
  } catch (error) {
    logTest('Get notification preferences', false, error);
  }

  // Test 6.4: Update notification preferences
  try {
    const response = await apiCall('put', '/notifications/preferences', {
      habitReminders: true,
      streakMilestones: true
    });
    logTest('Update notification preferences', response.status === 200);
  } catch (error) {
    logTest('Update notification preferences', false, error);
  }
}

// ============================================
// 7. WELLBEING TESTS
// ============================================
async function testWellbeing() {
  console.log('\n📝 Testing Wellbeing...\n');

  // Test 7.1: Log mood
  try {
    const response = await apiCall('post', '/wellbeing/mood', {
      mood: 4,
      energy: 3,
      stress: 2,
      notes: 'Feeling good today'
    });
    logTest('Log mood', response.status === 201);
  } catch (error) {
    logTest('Log mood', false, error);
  }

  // Test 7.2: Get mood history
  try {
    const response = await apiCall('get', '/wellbeing/mood');
    logTest('Get mood history', response.status === 200);
  } catch (error) {
    logTest('Get mood history', false, error);
  }

  // Test 7.3: Get wellbeing insights
  try {
    const response = await apiCall('get', '/wellbeing/insights');
    logTest('Get wellbeing insights', response.status === 200);
  } catch (error) {
    logTest('Get wellbeing insights', false, error);
  }
}

// ============================================
// 8. ANALYTICS TESTS
// ============================================
async function testAnalytics() {
  console.log('\n📝 Testing Analytics...\n');

  // Test 8.1: Get analytics summary
  try {
    const response = await apiCall('get', '/analytics/summary');
    logTest('Get analytics summary', response.status === 200);
  } catch (error) {
    logTest('Get analytics summary', false, error);
  }

  // Test 8.2: Get habit performance
  try {
    const response = await apiCall('get', '/analytics/habit-performance');
    logTest('Get habit performance', response.status === 200);
  } catch (error) {
    logTest('Get habit performance', false, error);
  }

  // Test 8.3: Export data
  try {
    const response = await apiCall('get', '/analytics/export');
    logTest('Export data', response.status === 200);
  } catch (error) {
    logTest('Export data', false, error);
  }
}

// ============================================
// 9. AI INSIGHTS TESTS
// ============================================
async function testAI() {
  console.log('\n📝 Testing AI Insights...\n');

  // Test 9.1: Get habit suggestions
  try {
    const response = await apiCall('get', '/ai/suggestions');
    logTest('Get habit suggestions', response.status === 200);
  } catch (error) {
    logTest('Get habit suggestions', false, error);
  }

  // Test 9.2: Get pattern analysis
  try {
    const response = await apiCall('get', '/ai/patterns');
    logTest('Get pattern analysis', response.status === 200);
  } catch (error) {
    logTest('Get pattern analysis', false, error);
  }

  // Test 9.3: Get motivational message
  try {
    const response = await apiCall('get', '/ai/motivation');
    logTest('Get motivational message', response.status === 200);
  } catch (error) {
    logTest('Get motivational message', false, error);
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.log('🚀 Starting HabitForge API Test Suite...\n');
  console.log('='.repeat(50));

  try {
    await testAuthentication();
    await testHabits();
    await testGamification();
    await testCommunity();
    await testChallenges();
    await testNotifications();
    await testWellbeing();
    await testAnalytics();
    await testAI();

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 TEST SUMMARY\n');
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
    console.log('\n' + '='.repeat(50));

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
