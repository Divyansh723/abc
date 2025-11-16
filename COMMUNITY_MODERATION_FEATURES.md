# Community Moderation & Safety Features

## Overview
Implemented comprehensive moderation and safety features for HabitForge community circles to ensure a safe, respectful environment for all users.

## Features Implemented

### 1. Rate Limiting ✅
**Requirement 6.3**

#### Implementation:
- **Maximum 10 messages per user per day** (configurable per circle)
- Rate limit resets at midnight (00:00) in the server timezone
- Real-time tracking of messages posted today
- Clear feedback when limit is reached

#### API Endpoints:
```javascript
// Post a message (with rate limiting)
POST /api/community/:circleId/messages
Body: { content: "message text" }

// Get user's message stats
GET /api/community/:circleId/messages/stats
Response: {
  messagesPosted: 5,
  maxMessages: 10,
  messagesRemaining: 5,
  resetTime: "2024-01-02T00:00:00.000Z",
  canPost: true
}
```

#### Error Response (Rate Limit Exceeded):
```json
{
  "success": false,
  "message": "Daily message limit reached (10 messages per day)",
  "data": {
    "messagesPosted": 10,
    "maxMessages": 10,
    "resetTime": "2024-01-02T00:00:00.000Z"
  }
}
```

---

### 2. Profanity Filtering ✅
**Requirement 6.3**

#### Implementation:
- **Enhanced profanity detection** with pattern matching
- Detects common variations and leetspeak (e.g., "sh!t", "f@ck")
- Handles obfuscation attempts (spaces, dots, asterisks between letters)
- Severity analysis (low, medium, high)
- Configurable per circle (enabled by default)

#### Profanity Filter Features:
```javascript
// Check if text contains profanity
containsProfanity(text) → boolean

// Filter profanity (replace with asterisks)
filterProfanity(text) → string

// Analyze profanity severity
analyzeProfanity(text) → {
  hasProfanity: boolean,
  count: number,
  severity: 'none' | 'low' | 'medium' | 'high'
}
```

#### Error Response (Profanity Detected):
```json
{
  "success": false,
  "message": "Message contains inappropriate content",
  "data": {
    "reason": "profanity_detected",
    "severity": "medium"
  }
}
```

---

### 3. Content Reporting System ✅
**Requirement 6.4**

#### Implementation:
- **Report inappropriate messages** with specific reasons
- Multiple users can report the same message
- Auto-hide messages after 3 reports (configurable threshold)
- Admin dashboard for reviewing reported content
- Prevent duplicate reports from same user

#### Report Reasons:
- `spam` - Unwanted promotional content
- `harassment` - Bullying or threatening behavior
- `inappropriate` - Content not suitable for the community
- `offensive` - Discriminatory or hateful content
- `other` - Other violations

#### API Endpoints:
```javascript
// Report a message
POST /api/community/:circleId/messages/:messageId/report
Body: { reason: "harassment" }

// Get reported messages (admin only)
GET /api/community/:circleId/messages/reported

// Delete a message (admin only)
DELETE /api/community/:circleId/messages/:messageId
```

#### Report Response:
```json
{
  "success": true,
  "message": "Message reported successfully",
  "data": {
    "reportCount": 2,
    "hidden": false
  }
}
```

---

### 4. Leaderboard Privacy Controls ✅
**Requirement 6.4**

#### Implementation:
- **Opt-out of leaderboard visibility** per circle
- User's progress hidden from shared leaderboard
- Still participate in circle activities
- Toggle on/off at any time

#### API Endpoint:
```javascript
// Toggle leaderboard opt-out
PUT /api/community/:circleId/leaderboard/opt-out

Response: {
  "success": true,
  "message": "Leaderboard visibility disabled",
  "data": {
    "optOutOfLeaderboard": true
  }
}
```

---

## Database Schema Updates

### CommunityCircle Model

#### Message Schema:
```javascript
{
  userId: ObjectId,
  content: String (max 500 chars),
  createdAt: Date,
  reported: Boolean,
  reportedBy: [ObjectId],
  reportReasons: [{
    userId: ObjectId,
    reason: String (enum),
    reportedAt: Date
  }],
  hidden: Boolean  // Auto-hidden after threshold
}
```

#### Moderation Settings:
```javascript
moderationSettings: {
  maxMessagesPerDay: Number (default: 10),
  profanityFilterEnabled: Boolean (default: true),
  requireApproval: Boolean (default: false)
}
```

#### Member Schema:
```javascript
{
  userId: ObjectId,
  role: String (admin/member),
  joinedAt: Date,
  optOutOfLeaderboard: Boolean (default: false)
}
```

---

## Security Features

### 1. Access Control
- ✅ Only members can post messages
- ✅ Only members can report messages
- ✅ Only admins can view reported messages
- ✅ Only admins can delete messages
- ✅ Proper authentication on all endpoints

### 2. Input Validation
- ✅ Message length validation (1-500 characters)
- ✅ Profanity detection before saving
- ✅ Rate limiting enforcement
- ✅ Valid report reason validation

### 3. Audit Trail
- ✅ Track who reported each message
- ✅ Store report reasons and timestamps
- ✅ Log message creation times
- ✅ Track moderation actions

---

## Admin Moderation Dashboard

### Features:
1. **View Reported Messages**
   - See all reported messages in a circle
   - Sort by report count (most reported first)
   - View who reported and why
   - See if message is auto-hidden

2. **Moderation Actions**
   - Delete inappropriate messages
   - Review report reasons
   - Monitor community health

### Example Response:
```json
{
  "success": true,
  "data": {
    "circleId": "...",
    "circleName": "Fitness Warriors",
    "reportedMessages": [
      {
        "_id": "...",
        "content": "message text",
        "userId": { "name": "John" },
        "createdAt": "2024-01-01T10:00:00.000Z",
        "reportCount": 3,
        "reportedBy": [...],
        "reportReasons": [
          {
            "userId": "...",
            "reason": "harassment",
            "reportedAt": "2024-01-01T11:00:00.000Z"
          }
        ],
        "hidden": true
      }
    ],
    "totalReported": 1
  }
}
```

---

## Configuration Options

### Per-Circle Settings:
```javascript
{
  maxMessagesPerDay: 10,           // Adjustable (2-50)
  profanityFilterEnabled: true,    // Can be disabled
  requireApproval: false,          // Future: require admin approval
  autoHideThreshold: 3             // Reports before auto-hide
}
```

---

## Testing Scenarios

### 1. Rate Limiting
- ✅ User can post up to 10 messages per day
- ✅ 11th message is rejected with clear error
- ✅ Counter resets at midnight
- ✅ Stats endpoint shows remaining messages

### 2. Profanity Filter
- ✅ Direct profanity is blocked
- ✅ Leetspeak variations are detected
- ✅ Obfuscation attempts are caught
- ✅ Clean messages pass through

### 3. Reporting System
- ✅ Users can report messages with reasons
- ✅ Duplicate reports are prevented
- ✅ Messages auto-hide after 3 reports
- ✅ Admins can view all reports
- ✅ Admins can delete messages

### 4. Privacy Controls
- ✅ Users can opt out of leaderboard
- ✅ Opted-out users don't appear in rankings
- ✅ Users can toggle setting anytime
- ✅ Setting persists across sessions

---

## Future Enhancements

### Potential Improvements:
1. **Advanced Moderation**
   - AI-powered content moderation
   - Automatic spam detection
   - User reputation system
   - Temporary muting/banning

2. **Enhanced Reporting**
   - Appeal system for false reports
   - Moderator notes on reports
   - Report history tracking
   - Email notifications for admins

3. **Better Profanity Filter**
   - Use external API (e.g., Perspective API)
   - Multi-language support
   - Context-aware filtering
   - Custom word lists per circle

4. **Analytics**
   - Moderation metrics dashboard
   - Report trends over time
   - User behavior patterns
   - Community health scores

---

## API Summary

### Message Management:
- `POST /api/community/:circleId/messages` - Post message (rate limited, profanity filtered)
- `GET /api/community/:circleId/messages/stats` - Get user's message stats
- `DELETE /api/community/:circleId/messages/:messageId` - Delete message (admin)

### Reporting:
- `POST /api/community/:circleId/messages/:messageId/report` - Report message
- `GET /api/community/:circleId/messages/reported` - View reported messages (admin)

### Privacy:
- `PUT /api/community/:circleId/leaderboard/opt-out` - Toggle leaderboard visibility

---

## Compliance

### Requirements Met:
- ✅ **6.3** - Rate limiting (10 messages/day) and profanity filtering
- ✅ **6.4** - Reporting mechanisms and leaderboard opt-out

### Safety Standards:
- ✅ Content moderation before posting
- ✅ User reporting system
- ✅ Admin oversight tools
- ✅ Privacy controls
- ✅ Audit trail for accountability

---

## Conclusion

The community moderation system provides a comprehensive safety framework that:
- **Prevents abuse** through rate limiting
- **Filters inappropriate content** with profanity detection
- **Empowers users** to report violations
- **Protects privacy** with opt-out controls
- **Enables admins** to maintain healthy communities

All features are production-ready and meet the specified requirements for a safe, respectful community environment. 🛡️✅
