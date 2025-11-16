import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Notification from './src/models/Notification.js';
import User from './src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const API_URL = 'http://localhost:8000/api';

async function testMarkAsRead() {
  try {
    console.log('=== Testing Mark as Read Functionality ===\n');

    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database\n');

    // Find a test user
    const user = await User.findOne();
    if (!user) {
      console.error('No users found in database');
      process.exit(1);
    }
    console.log('Test user:', user.email);
    console.log('User ID:', user._id.toString(), '\n');

    // Create a test notification
    console.log('Creating test notification...');
    const notification = await Notification.create({
      userId: user._id,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification to verify mark-as-read functionality',
      read: false
    });
    console.log('Created notification:', notification._id.toString());
    console.log('Read status:', notification.read, '\n');

    // Get the notification ID (as string, like frontend sends)
    const notificationId = notification._id.toString();
    console.log('Notification ID (string):', notificationId, '\n');

    // Test the markAsRead static method directly
    console.log('Testing Notification.markAsRead() method...');
    const result = await Notification.markAsRead(user._id, [notificationId]);
    console.log('Update result:', result);
    console.log('Modified count:', result.modifiedCount, '\n');

    // Verify the notification was marked as read
    const updatedNotification = await Notification.findById(notification._id);
    console.log('Updated notification read status:', updatedNotification.read);
    
    if (updatedNotification.read) {
      console.log('✅ SUCCESS: Notification was marked as read!\n');
    } else {
      console.log('❌ FAILED: Notification was NOT marked as read\n');
    }

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(user._id);
    console.log('Unread count for user:', unreadCount, '\n');

    // Cleanup
    console.log('Cleaning up test notification...');
    await Notification.findByIdAndDelete(notification._id);
    console.log('Test notification deleted\n');

    console.log('=== Test Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

testMarkAsRead();
