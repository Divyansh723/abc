import CommunityCircle from '../models/CommunityCircle.js';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import Completion from '../models/Completion.js';
import crypto from 'crypto';
import { containsProfanity, analyzeProfanity } from '../utils/profanityFilter.js';

// Generate unique invite code
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Create a new community circle
export const createCircle = async (req, res) => {
  try {
    const { name, description, maxMembers, isPrivate } = req.body;
    const userId = req.user._id;

    const inviteCode = isPrivate ? generateInviteCode() : null;

    const circle = new CommunityCircle({
      name,
      description,
      createdBy: userId,
      maxMembers: maxMembers || 10,
      isPrivate: isPrivate || false,
      inviteCode,
      members: [{
        userId,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    await circle.save();

    res.status(201).json({
      success: true,
      message: 'Community circle created successfully',
      data: {
        circle: circle.toObject({ virtuals: true }),
        inviteCode
      }
    });
  } catch (error) {
    console.error('Create circle error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create community circle'
    });
  }
};

// Get all circles (public + user's private circles)
export const getCircles = async (req, res) => {
  try {
    const userId = req.user._id;
    const { search, page = 1, limit = 20 } = req.query;

    const query = {
      $or: [
        { isPrivate: false },
        { 'members.userId': userId }
      ]
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const circles = await CommunityCircle.find(query)
      .populate('createdBy', 'name')
      .populate('members.userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CommunityCircle.countDocuments(query);

    // Add user membership info and clean up deleted users
    const circlesWithMembership = circles.map(circle => {
      const circleObj = circle.toObject({ virtuals: true });
      circleObj.userIsMember = circle.isMember(userId);
      circleObj.userIsAdmin = circle.isAdmin(userId);
      
      // Filter out members with deleted accounts
      circleObj.members = circleObj.members.filter(member => member.userId != null);
      
      // Recalculate member count after filtering
      circleObj.memberCount = circleObj.members.length;
      circleObj.availableSpots = circleObj.maxMembers - circleObj.memberCount;
      
      return circleObj;
    });

    res.json({
      success: true,
      data: circlesWithMembership,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get circles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community circles'
    });
  }
};

// Get single circle by ID
export const getCircleById = async (req, res) => {
  try {
    const { circleId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId)
      .populate('createdBy', 'name')
      .populate('members.userId', 'name')
      .populate('messages.userId', 'name')
      .populate('announcements.createdBy', 'name');

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    // Check access for private circles
    if (circle.isPrivate && !circle.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private circle'
      });
    }

    const circleObj = circle.toObject({ virtuals: true });
    circleObj.userIsMember = circle.isMember(userId);
    circleObj.userIsAdmin = circle.isAdmin(userId);

    // Clean up members with deleted user accounts
    circleObj.members = circleObj.members.filter(member => {
      if (!member.userId) {
        console.log('Removing member with deleted user account');
        return false;
      }
      return true;
    }).map(member => ({
      ...member,
      name: member.userId?.name || 'Deleted User'
    }));

    // Clean up messages from deleted users
    circleObj.messages = circleObj.messages.filter(msg => {
      if (!msg.userId) {
        console.log('Removing message from deleted user');
        return false;
      }
      return true;
    }).map(msg => {
      const member = circle.members.find(m => 
        m.userId && m.userId._id && m.userId._id.toString() === (msg.userId._id || msg.userId).toString()
      );
      
      // If user opted out of leaderboard, show as Anonymous
      if (member && member.optOutOfLeaderboard) {
        return {
          ...msg,
          userId: {
            _id: msg.userId._id || msg.userId,
            name: 'Anonymous'
          }
        };
      }
      
      // Handle deleted users
      if (!msg.userId || !msg.userId.name) {
        return {
          ...msg,
          userId: {
            _id: msg.userId?._id || msg.userId || 'deleted',
            name: 'Deleted User'
          }
        };
      }
      
      return msg;
    });

    // Clean up announcements from deleted users
    if (circleObj.announcements) {
      circleObj.announcements = circleObj.announcements.map(announcement => ({
        ...announcement,
        createdBy: announcement.createdBy || { _id: 'deleted', name: 'Deleted User' }
      }));
    }

    // Clean up challenges - filter out participants with deleted accounts
    if (circleObj.challenges) {
      circleObj.challenges = circleObj.challenges.map(challenge => ({
        ...challenge,
        participants: challenge.participants.filter(p => p.userId)
      }));
    }

    res.json({
      success: true,
      data: circleObj
    });
  } catch (error) {
    console.error('Get circle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch circle'
    });
  }
};

// Join a circle
export const joinCircle = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { inviteCode } = req.body;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    // Check invite code for private circles
    if (circle.isPrivate && circle.inviteCode !== inviteCode) {
      return res.status(403).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    await circle.addMember(userId);

    res.json({
      success: true,
      message: 'Successfully joined circle',
      data: {
        circleId: circle._id,
        memberCount: circle.memberCount
      }
    });
  } catch (error) {
    console.error('Join circle error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to join circle'
    });
  }
};

// Update circle details (admin only)
export const updateCircle = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    // Check if user is admin
    if (!circle.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update circle details'
      });
    }

    // Update fields if provided
    if (name !== undefined) circle.name = name;
    if (description !== undefined) circle.description = description;

    await circle.save();

    const circleObj = circle.toObject({ virtuals: true });
    circleObj.userIsMember = circle.isMember(userId);
    circleObj.userIsAdmin = circle.isAdmin(userId);

    res.json({
      success: true,
      message: 'Circle updated successfully',
      data: circleObj
    });
  } catch (error) {
    console.error('Update circle error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update circle'
    });
  }
};

// Leave a circle
export const leaveCircle = async (req, res) => {
  try {
    const { circleId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    // Don't allow creator to leave if there are other members
    if (circle.createdBy.toString() === userId.toString() && circle.members.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Transfer admin role before leaving'
      });
    }

    await circle.removeMember(userId);

    // Delete circle if no members left
    if (circle.members.length === 0) {
      await CommunityCircle.findByIdAndDelete(circleId);
    }

    res.json({
      success: true,
      message: 'Successfully left circle'
    });
  } catch (error) {
    console.error('Leave circle error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to leave circle'
    });
  }
};

// Delete a circle (admin only)
export const deleteCircle = async (req, res) => {
  try {
    const { circleId } = req.params;
    const userId = req.user._id;
    const Notification = (await import('../models/Notification.js')).default;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    // Check if user is admin
    if (!circle.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete the circle'
      });
    }

    const circleName = circle.name;
    const memberIds = circle.members
      .map(m => m.userId)
      .filter(id => id && id.toString() !== userId.toString()); // Exclude the admin who deleted it

    // Delete the circle
    await CommunityCircle.findByIdAndDelete(circleId);

    // Send notifications to all members
    if (memberIds.length > 0) {
      const notifications = memberIds.map(memberId => ({
        userId: memberId,
        type: 'community',
        title: 'Community Circle Deleted',
        message: `The community circle "${circleName}" has been deleted by an admin.`,
        read: false
      }));

      await Notification.insertMany(notifications);
      console.log(`Sent deletion notifications to ${memberIds.length} members`);
    }

    res.json({
      success: true,
      message: 'Circle deleted successfully'
    });
  } catch (error) {
    console.error('Delete circle error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete circle'
    });
  }
};

// Post a message to circle
export const postMessage = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds maximum length of 500 characters'
      });
    }

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    if (!circle.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only members can post messages'
      });
    }

    // Check rate limiting
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const userMessagesToday = circle.messages.filter(m => 
      m.userId.toString() === userId.toString() && 
      m.createdAt >= today
    ).length;
    
    const maxMessages = circle.moderationSettings.maxMessagesPerDay;
    if (userMessagesToday >= maxMessages) {
      return res.status(429).json({
        success: false,
        message: `Daily message limit reached (${maxMessages} messages per day)`,
        data: {
          messagesPosted: userMessagesToday,
          maxMessages,
          resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });
    }

    // Check profanity
    if (circle.moderationSettings.profanityFilterEnabled) {
      const profanityAnalysis = analyzeProfanity(content);
      if (profanityAnalysis.hasProfanity) {
        return res.status(400).json({
          success: false,
          message: 'Message contains inappropriate content',
          data: {
            reason: 'profanity_detected',
            severity: profanityAnalysis.severity
          }
        });
      }
    }

    await circle.addMessage(userId, content);

    // Populate the new message with user info
    await circle.populate('messages.userId', 'name');
    const newMessage = circle.messages[circle.messages.length - 1];

    res.json({
      success: true,
      message: 'Message posted successfully',
      data: {
        message: newMessage,
        messagesRemaining: maxMessages - userMessagesToday - 1
      }
    });
  } catch (error) {
    console.error('Post message error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to post message'
    });
  }
};

// Get circle leaderboard
export const getCircleLeaderboard = async (req, res) => {
  try {
    const { circleId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId)
      .populate('members.userId', 'name');

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    if (!circle.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only members can view leaderboard'
      });
    }

    // Calculate weekly streak averages and community points for each member
    const leaderboard = await Promise.all(
      circle.members
        .filter(member => !member.optOutOfLeaderboard)
        .map(async (member) => {
          const memberId = member.userId._id || member.userId;
          
          // Get user's habits (using 'active' field, not 'isActive')
          const habits = await Habit.find({ userId: memberId, active: true, archived: false });
          
          console.log(`User ${member.userId.name} has ${habits.length} active habits`);
          
          // Calculate current streak for each habit
          let totalCurrentStreak = 0;
          for (const habit of habits) {
            // Get the habit's current streak from the model
            const streak = habit.currentStreak || 0;
            console.log(`  - Habit "${habit.name}": streak = ${streak}`);
            totalCurrentStreak += streak;
          }
          
          // Calculate average streak across all habits
          const avgStreak = habits.length > 0 ? totalCurrentStreak / habits.length : 0;
          
          console.log(`  Total streak: ${totalCurrentStreak}, Avg: ${avgStreak}`);
          
          return {
            userId: memberId,
            name: member.userId.name || 'Unknown',
            weeklyStreakAverage: Math.round(avgStreak * 10) / 10,
            habitCount: habits.length,
            communityPoints: member.communityPoints || 0
          };
        })
    );

    // Sort by community points first, then by weekly streak average
    leaderboard.sort((a, b) => {
      if (b.communityPoints !== a.communityPoints) {
        return b.communityPoints - a.communityPoints;
      }
      return b.weeklyStreakAverage - a.weeklyStreakAverage;
    });

    res.json({
      success: true,
      data: {
        circleId: circle._id,
        circleName: circle.name,
        leaderboard,
        lastUpdated: circle.lastLeaderboardUpdate || new Date()
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

// Toggle leaderboard opt-out
export const toggleLeaderboardOptOut = async (req, res) => {
  try {
    const { circleId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    const member = circle.members.find(m => {
      // Handle both populated and unpopulated userId
      const memberId = m.userId._id || m.userId;
      return memberId.toString() === userId.toString();
    });
    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this circle'
      });
    }

    member.optOutOfLeaderboard = !member.optOutOfLeaderboard;
    await circle.save();

    res.json({
      success: true,
      message: `Leaderboard visibility ${member.optOutOfLeaderboard ? 'disabled' : 'enabled'}`,
      data: {
        optOutOfLeaderboard: member.optOutOfLeaderboard
      }
    });
  } catch (error) {
    console.error('Toggle leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leaderboard settings'
    });
  }
};

// Get user's message stats for rate limiting
export const getMessageStats = async (req, res) => {
  try {
    const { circleId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    if (!circle.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only members can view message stats'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userMessagesToday = circle.messages.filter(m => 
      m.userId.toString() === userId.toString() && 
      m.createdAt >= today
    ).length;

    const maxMessages = circle.moderationSettings.maxMessagesPerDay;

    res.json({
      success: true,
      data: {
        messagesPosted: userMessagesToday,
        maxMessages,
        messagesRemaining: Math.max(0, maxMessages - userMessagesToday),
        resetTime: tomorrow,
        canPost: userMessagesToday < maxMessages
      }
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message stats'
    });
  }
};

// Report a message
export const reportMessage = async (req, res) => {
  try {
    const { circleId, messageId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const validReasons = ['spam', 'harassment', 'inappropriate', 'offensive', 'other'];
    if (reason && !validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report reason'
      });
    }

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    if (!circle.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only members can report messages'
      });
    }

    const message = circle.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reported this message
    const alreadyReported = message.reportedBy.some(
      id => id.toString() === userId.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this message'
      });
    }

    // Add report
    message.reportedBy.push(userId);
    message.reported = true;
    
    // Store report reason if provided
    if (!message.reportReasons) {
      message.reportReasons = [];
    }
    message.reportReasons.push({
      userId,
      reason: reason || 'other',
      reportedAt: new Date()
    });

    await circle.save();

    // Auto-hide message if it reaches threshold (e.g., 3 reports)
    const reportThreshold = 3;
    if (message.reportedBy.length >= reportThreshold) {
      message.hidden = true;
      await circle.save();
      
      // Notify admins (in a real app, send notification)
      console.log(`Message ${messageId} in circle ${circleId} auto-hidden due to ${message.reportedBy.length} reports`);
    }

    res.json({
      success: true,
      message: 'Message reported successfully',
      data: {
        reportCount: message.reportedBy.length,
        hidden: message.hidden || false
      }
    });
  } catch (error) {
    console.error('Report message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report message'
    });
  }
};

// Get reported messages (admin only)
export const getReportedMessages = async (req, res) => {
  try {
    const { circleId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId)
      .populate('messages.userId', 'name')
      .populate('messages.reportedBy', 'name');

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    if (!circle.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view reported messages'
      });
    }

    const reportedMessages = circle.messages
      .filter(m => m.reported)
      .map(m => ({
        _id: m._id,
        content: m.content,
        userId: m.userId,
        createdAt: m.createdAt,
        reportCount: m.reportedBy.length,
        reportedBy: m.reportedBy,
        reportReasons: m.reportReasons || [],
        hidden: m.hidden || false
      }))
      .sort((a, b) => b.reportCount - a.reportCount);

    res.json({
      success: true,
      data: {
        circleId: circle._id,
        circleName: circle.name,
        reportedMessages,
        totalReported: reportedMessages.length
      }
    });
  } catch (error) {
    console.error('Get reported messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reported messages'
    });
  }
};

// Delete a message (admin only)
export const deleteMessage = async (req, res) => {
  try {
    const { circleId, messageId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    if (!circle.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete messages'
      });
    }

    const message = circle.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.remove();
    await circle.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Promote member to admin
export const promoteMember = async (req, res) => {
  try {
    const { circleId, memberId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    await circle.promoteMember(userId, memberId);

    res.json({
      success: true,
      message: 'Member promoted to admin successfully'
    });
  } catch (error) {
    console.error('Promote member error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to promote member'
    });
  }
};

// Remove member (admin only)
export const removeMember = async (req, res) => {
  try {
    const { circleId, memberId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Removal reason is required'
      });
    }

    if (reason.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Reason must be less than 500 characters'
      });
    }

    await circle.removeMemberByAdmin(userId, memberId);

    // Send notification to removed member
    const Notification = (await import('../models/Notification.js')).default;
    console.log('Creating notification for removed member:', {
      userId: memberId,
      circleName: circle.name,
      reason
    });
    
    const notification = await Notification.createNotification({
      userId: memberId,
      type: 'community',
      title: `Removed from ${circle.name}`,
      message: `You have been removed from the community circle "${circle.name}". Reason: ${reason}`,
      actionUrl: '/community',
      metadata: {
        circleId: circle._id,
        circleName: circle.name,
        reason,
        removedBy: userId
      }
    });

    console.log('Notification created successfully:', notification);

    res.json({
      success: true,
      message: 'Member removed successfully and notified'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to remove member'
    });
  }
};

// Create event (admin only)
export const createEvent = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { title, description, startDate, endDate } = req.body;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    await circle.addEvent(userId, { title, description, startDate, endDate });

    res.status(201).json({
      success: true,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create event'
    });
  }
};

// Create challenge (admin only)
export const createChallenge = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { title, description, type, target, pointsReward, startDate, endDate, habitTemplate } = req.body;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    await circle.addChallenge(userId, {
      title,
      description,
      type,
      target,
      pointsReward: pointsReward || 50,
      startDate,
      endDate,
      habitTemplate
    });

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully'
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    
    // Check if it's a validation error related to habit template
    if (error.name === 'ValidationError' && error.message.includes('habitTemplate')) {
      return res.status(400).json({
        success: false,
        message: 'Please create habit before submitting the form'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create challenge'
    });
  }
};

// Join challenge
export const joinChallenge = async (req, res) => {
  try {
    const { circleId, challengeId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    await circle.joinChallenge(userId, challengeId);

    res.json({
      success: true,
      message: 'Joined challenge successfully'
    });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to join challenge'
    });
  }
};

// Update challenge progress
export const updateChallengeProgress = async (req, res) => {
  try {
    const { circleId, challengeId } = req.params;
    const { progress } = req.body;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    await circle.updateChallengeProgress(userId, challengeId, progress);

    res.json({
      success: true,
      message: 'Challenge progress updated'
    });
  } catch (error) {
    console.error('Update challenge progress error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update progress'
    });
  }
};

// Create announcement (admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { title, content, isImportant } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title and content cannot be empty'
      });
    }

    if (title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must be 100 characters or less'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Content must be 1000 characters or less'
      });
    }

    const circle = await CommunityCircle.findById(circleId);
    
    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    // Check if user is admin
    if (!circle.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create announcements'
      });
    }

    // Add announcement
    await circle.addAnnouncement(userId, { 
      title: title.trim(), 
      content: content.trim(), 
      isImportant: !!isImportant 
    });

    // Populate the new announcement with user info
    await circle.populate('announcements.createdBy', 'name');
    const newAnnouncement = circle.announcements[circle.announcements.length - 1];

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: {
        announcement: newAnnouncement
      }
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create announcement'
    });
  }
};

// Get announcements for a circle
export const getAnnouncements = async (req, res) => {
  try {
    const { circleId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId)
      .populate('announcements.createdBy', 'name');

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    // Check if user is a member
    if (!circle.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only members can view announcements'
      });
    }

    // Sort announcements by date (newest first)
    const announcements = circle.announcements
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(announcement => ({
        _id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        isImportant: announcement.isImportant,
        createdBy: announcement.createdBy,
        createdAt: announcement.createdAt
      }));

    res.json({
      success: true,
      data: {
        circleId: circle._id,
        circleName: circle.name,
        announcements,
        totalAnnouncements: announcements.length
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements'
    });
  }
};

// Delete announcement (admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { circleId, announcementId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    if (!circle.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete announcements'
      });
    }

    const announcement = circle.announcements.id(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Use pull to remove subdocument from array
    circle.announcements.pull(announcementId);
    await circle.save();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete announcement'
    });
  }
};

// Update announcement (admin only)
export const updateAnnouncement = async (req, res) => {
  try {
    const { circleId, announcementId } = req.params;
    const { title, content, isImportant } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title and content cannot be empty'
      });
    }

    if (title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must be 100 characters or less'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Content must be 1000 characters or less'
      });
    }

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    if (!circle.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update announcements'
      });
    }

    const announcement = circle.announcements.id(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Update announcement fields
    announcement.title = title.trim();
    announcement.content = content.trim();
    announcement.isImportant = !!isImportant;

    await circle.save();

    // Populate the updated announcement
    await circle.populate('announcements.createdBy', 'name');
    const updatedAnnouncement = circle.announcements.id(announcementId);

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: {
        announcement: updatedAnnouncement
      }
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update announcement'
    });
  }
};

// Update challenge (admin only)
export const updateChallenge = async (req, res) => {
  try {
    const { circleId, challengeId } = req.params;
    const { title, description, type, target, pointsReward, startDate, endDate, habitTemplate } = req.body;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    if (!circle.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update challenges'
      });
    }

    const challenge = circle.challenges.id(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Update challenge fields
    if (title) challenge.title = title.trim();
    if (description !== undefined) challenge.description = description.trim();
    if (type) challenge.type = type;
    if (target) challenge.target = target;
    if (pointsReward) challenge.pointsReward = pointsReward;
    if (startDate) challenge.startDate = new Date(startDate);
    if (endDate) challenge.endDate = new Date(endDate);
    if (habitTemplate !== undefined) challenge.habitTemplate = habitTemplate;

    await circle.save();

    res.json({
      success: true,
      message: 'Challenge updated successfully',
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    
    // Check if it's a validation error related to habit template
    if (error.name === 'ValidationError' && error.message.includes('habitTemplate')) {
      return res.status(400).json({
        success: false,
        message: 'Please create habit before submitting the form'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update challenge'
    });
  }
};

// Delete challenge (admin only)
export const deleteChallenge = async (req, res) => {
  try {
    const { circleId, challengeId } = req.params;
    const userId = req.user._id;

    const circle = await CommunityCircle.findById(circleId);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }

    if (!circle.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete challenges'
      });
    }

    const challenge = circle.challenges.id(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Delete all habits associated with this challenge from all participants
    const habitIds = challenge.participants
      .filter(p => p.habitId)
      .map(p => p.habitId);
    
    if (habitIds.length > 0) {
      await Habit.deleteMany({
        _id: { $in: habitIds },
        isChallengeHabit: true
      });
      console.log(`Deleted ${habitIds.length} habits associated with challenge ${challengeId}`);
    }

    // Use pull to remove subdocument from array
    circle.challenges.pull(challengeId);
    await circle.save();

    res.json({
      success: true,
      message: 'Challenge deleted successfully',
      data: {
        habitsDeleted: habitIds.length
      }
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete challenge'
    });
  }
};
