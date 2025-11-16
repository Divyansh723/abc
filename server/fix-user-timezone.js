import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './src/models/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const fixTimezone = async () => {
  try {
    console.log('🔧 Fixing User Timezone...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      process.exit(1);
    }

    console.log(`📋 User: ${user.name}`);
    console.log(`🌍 Current Timezone: ${user.timezone || 'UTC'}`);

    // Update timezone to UTC
    user.timezone = 'UTC';
    await user.save();

    console.log(`✅ Updated Timezone to: UTC\n`);

    console.log(`💡 Note:`);
    console.log(`   The reminder time 12:42 will now be interpreted as 12:42 UTC`);
    console.log(`   Which is 18:12 IST (6:12 PM India time)`);
    console.log(`   The notification will be sent at 12:42 UTC every day\n`);

    await mongoose.disconnect();
    console.log('✅ Fix complete');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixTimezone();
