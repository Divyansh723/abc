# AI Coaching Audit Trail Documentation

## Overview
The AI coaching feature now includes comprehensive interaction logging and audit trail capabilities. This allows tracking of all AI coaching interactions for transparency, debugging, and user insights.

## What Gets Logged

### Logged Interactions
- **Motivational Content** (`/api/ai/motivation`)
- **Personalized Coaching** (`/api/ai/coaching`)

### Logged Data Points
For each interaction, the following information is captured:

1. **User Information**
   - User ID
   - IP Address
   - User Agent (browser/device info)

2. **Request Details**
   - Interaction type (motivational_content, personalized_coaching)
   - Context (daily, coaching, etc.)
   - Challenge (if provided)
   - Timestamp

3. **Response Details**
   - Success/failure status
   - Response time (in milliseconds)
   - AI model used (e.g., gemini-2.0-flash-exp)
   - Response metadata (tone, data points used)

4. **Error Information** (if applicable)
   - Error message
   - Failure reason

## Database Schema

### AIInteractionLog Model
```javascript
{
  userId: ObjectId,              // Reference to User
  interactionType: String,       // 'coaching', 'motivational_content', 'personalized_coaching'
  context: String,               // 'daily', 'coaching', etc.
  challenge: String,             // Optional challenge text
  requestData: Mixed,            // Request metadata
  responseData: Mixed,           // Response metadata
  modelUsed: String,             // AI model name
  success: Boolean,              // Success status
  errorMessage: String,          // Error details if failed
  responseTime: Number,          // Response time in ms
  timestamp: Date,               // When interaction occurred
  userAgent: String,             // Browser/device info
  ipAddress: String              // User's IP address
}
```

### Indexes
- `userId + timestamp` - For efficient user history queries
- `interactionType + timestamp` - For type-based analytics
- `success + timestamp` - For error tracking

## API Endpoints

### 1. Get Coaching History
**GET** `/api/ai/coaching/history?limit=50`

Returns the user's AI coaching interaction history.

**Query Parameters:**
- `limit` (optional, default: 50) - Number of records to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "interactionType": "motivational_content",
      "context": "daily",
      "success": true,
      "responseTime": 1234,
      "modelUsed": "gemini-2.0-flash-exp",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 10
}
```

### 2. Get Interaction Statistics
**GET** `/api/ai/coaching/stats?days=30`

Returns aggregated statistics about AI coaching interactions.

**Query Parameters:**
- `days` (optional, default: 30) - Number of days to analyze

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "motivational_content",
      "count": 45,
      "successCount": 43,
      "avgResponseTime": 1567.8
    },
    {
      "_id": "personalized_coaching",
      "count": 12,
      "successCount": 12,
      "avgResponseTime": 1823.4
    }
  ]
}
```

## Usage Examples

### Backend - Logging an Interaction
The logging is automatic when using the AI service methods:

```javascript
// In aiService.js
const content = await aiService.generateMotivationalContent(
  userId, 
  'daily',
  {
    userAgent: req.get('user-agent'),
    ipAddress: req.ip
  }
);
```

### Frontend - Fetching Coaching History
```typescript
// Get user's coaching history
const response = await fetch('/api/ai/coaching/history?limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();
```

### Frontend - Fetching Statistics
```typescript
// Get 30-day statistics
const response = await fetch('/api/ai/coaching/stats?days=30', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();
```

## Privacy & Security

### Data Protection
- All logs are user-scoped (users can only access their own logs)
- Authentication required for all audit trail endpoints
- IP addresses and user agents are stored for security purposes only

### Data Retention
- Logs are stored indefinitely by default
- Consider implementing a retention policy (e.g., 90 days) for production
- Users can request deletion of their logs as part of GDPR compliance

### Sensitive Data
- Full AI prompts are NOT stored (only metadata)
- Full AI responses are NOT stored (only summary data)
- User habit data is NOT stored in logs (only counts)

## Performance Considerations

### Async Logging
- Logging is performed asynchronously
- Logging failures do NOT block the main AI response
- Errors in logging are caught and logged to console only

### Database Indexes
- Proper indexes ensure fast query performance
- Compound indexes optimize common query patterns
- Consider archiving old logs for long-term storage

## Monitoring & Analytics

### Key Metrics to Track
1. **Success Rate**: Percentage of successful AI interactions
2. **Response Time**: Average time to generate coaching content
3. **Usage Patterns**: When users request coaching most
4. **Model Performance**: Which AI models perform best
5. **Error Rates**: Track and investigate failures

### Example Analytics Query
```javascript
// Get success rate for last 7 days
const stats = await AIInteractionLog.aggregate([
  {
    $match: {
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      successful: { $sum: { $cond: ['$success', 1, 0] } },
      avgResponseTime: { $avg: '$responseTime' }
    }
  }
]);
```

## Future Enhancements

### Potential Additions
1. **User Feedback**: Allow users to rate AI coaching quality
2. **A/B Testing**: Track different prompt strategies
3. **Personalization Metrics**: Measure improvement over time
4. **Export Functionality**: Allow users to export their coaching history
5. **Admin Dashboard**: View system-wide AI usage statistics

## Troubleshooting

### Common Issues

**Issue**: Logs not being created
- Check MongoDB connection
- Verify AIInteractionLog model is imported
- Check console for logging errors

**Issue**: Slow query performance
- Verify indexes are created: `db.aiinteractionlogs.getIndexes()`
- Consider adding more specific indexes for your queries
- Archive old logs if collection is very large

**Issue**: Missing request metadata
- Ensure controllers pass `requestMetadata` object
- Check that Express is configured to parse IP addresses
- Verify user-agent header is being sent

## Compliance

### GDPR Considerations
- Users have right to access their logs (via `/coaching/history`)
- Users have right to deletion (implement deletion endpoint)
- Logs contain personal data (IP, usage patterns)
- Include in privacy policy and data processing agreements

### Audit Requirements
- Logs provide complete audit trail of AI interactions
- Timestamps are in UTC for consistency
- All interactions are traceable to specific users
- Success/failure status enables compliance reporting
