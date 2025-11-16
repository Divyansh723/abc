import CommunityCircle from '../models/CommunityCircle.js';

/**
 * Scheduled job to clean up ended challenges
 * Runs periodically to delete habits associated with ended challenges
 */
export const startChallengeCleanupJob = () => {
  // Run cleanup every 6 hours
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  
  // Run immediately on start
  runChallengeCleanup();
  
  // Then run every 6 hours
  setInterval(async () => {
    try {
      console.log('Running scheduled challenge cleanup...');
      await CommunityCircle.cleanupEndedChallenges();
      console.log('Challenge cleanup completed successfully');
    } catch (error) {
      console.error('Challenge cleanup job failed:', error);
    }
  }, SIX_HOURS);
  
  console.log('✅ Challenge cleanup job started (runs every 6 hours)');
};

/**
 * Manual cleanup function that can be called on-demand
 */
export const runChallengeCleanup = async () => {
  try {
    console.log('Running manual challenge cleanup...');
    await CommunityCircle.cleanupEndedChallenges();
    console.log('Manual challenge cleanup completed successfully');
    return { success: true, message: 'Cleanup completed' };
  } catch (error) {
    console.error('Manual challenge cleanup failed:', error);
    return { success: false, message: error.message };
  }
};

export default {
  startChallengeCleanupJob,
  runChallengeCleanup
};
