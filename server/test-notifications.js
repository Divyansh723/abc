import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const notificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: String,
  title: String,
  message: String,
  read: Boolean,
  actionUrl: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

async function testNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    console.log(`Found ${notifications.length} notifications:`);
    notifications.forEach(n => {
      console.log(`- ${n.title} (${n.type}) - Read: ${n.read} - Created: ${n.createdAt}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testNotifications();
