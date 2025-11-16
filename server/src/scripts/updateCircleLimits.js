import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import CommunityCircle from '../models/CommunityCircle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '../../.env') });

const updateCircleLimits = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all circles to have the new limits
    const result = await CommunityCircle.updateMany(
      {
        $or: [
          { 'moderationSettings.maxMessagesPerDay': { $lt: 100 } },
          { maxMembers: { $lt: 100 } }
        ]
      },
      {
        $set: {
          'moderationSettings.maxMessagesPerDay': 100,
          maxMembers: 100
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} circles with new limits:`);
    console.log('- Max members: 100');
    console.log('- Max messages per day: 100');

    // Display updated circles
    const circles = await CommunityCircle.find({});
    console.log('\nAll circles:');
    circles.forEach(circle => {
      console.log(`- ${circle.name}: ${circle.members.length}/${circle.maxMembers} members, ${circle.moderationSettings.maxMessagesPerDay} messages/day`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error updating circle limits:', error);
    process.exit(1);
  }
};

updateCircleLimits();
