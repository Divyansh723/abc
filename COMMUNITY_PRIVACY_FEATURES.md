# Community Privacy Features

## Overview
Implemented privacy controls for community circles that respect user preferences for data sharing and visibility.

## Problem Fixed
- ❌ **Before:** Messages showed "Unknown User" instead of actual names
- ❌ **Before:** No privacy controls for user visibility
- ✅ **After:** Messages show correct user names
- ✅ **After:** Users who opt out of leaderboard show as "Anonymous"

---

## Privacy Settings

### Leaderboard Opt-Out
**Requirement 6.4**

#### What It Does:
When a user opts out of the leaderboard:
1. **Leaderboard:** User is completely hidden from rankings
2. **Messages:** User's name shows as "Anonymous" in all messages
3. **Member List:** User still appears in member count but name is anonymized

#### How It Works:

**Frontend (CircleDetails.tsx):**
```typescript
// Check if userId is populated object or string
const userName = typeof message.userId === 'object' && message.userId?.name
  ? message.userId.name
  : message.name || 'Anonymous';
```

**Backend (communityController.js):**
```javascript
// Anonymize users who opted out
circleObj.messages = circleObj.messages.map(msg => {
  const member = circle.members.find(m => 
    m.userId._id.toString() === (msg.userId._id || msg.userId).toString()
  );
  
  if (member && member.optOutOfLeaderboard) {
    return {
      ...msg,
      userId: {
        _id: msg.userId._id || msg.userId,
        name: 'Anonymous'
      }
    };
  }
  
  return msg;
});
```

---

## User Name Display Logic

### Message Display Priority:
1. **Populated userId.name** - If userId is populated with user object
2. **Direct name field** - Fallback if name is directly on message
3. **"Anonymous"** - Default if no name available or user opted out

### Code Implementation:
```typescript
// Type definition supports both string and object
userId: string | { _id: string; name: string };

// Display logic
const userName = typeof message.userId === 'object' && message.userId?.name
  ? message.userId.name
  : message.name || 'Anonymous';
```

---

## Privacy Controls UI

### Toggle Leaderboard Visibility

**Location:** Circle Details → Leaderboard Tab

**UI Elements:**
```
┌─────────────────────────────────────────┐
│ 👁️ Visible on leaderboard              │
│                          [Hide Me] ←─── │
└─────────────────────────────────────────┘

OR

┌─────────────────────────────────────────┐
│ 👁️‍🗨️ Hidden from leaderboard             │
│                          [Show Me] ←─── │
└─────────────────────────────────────────┘
```

**Button Actions:**
- **"Hide Me"** - Opts out of leaderboard and anonymizes messages
- **"Show Me"** - Opts back in and shows real name

---

## Data Flow

### 1. User Posts Message
```
User → Frontend → Backend
         ↓
    POST /api/community/:circleId/messages
         ↓
    Save message with userId reference
```

### 2. Fetch Circle Data
```
Backend → MongoDB
    ↓
Populate userId with user name
    ↓
Check optOutOfLeaderboard setting
    ↓
Anonymize if opted out
    ↓
Return to Frontend
```

### 3. Display Message
```
Frontend receives message
    ↓
Check if userId is object or string
    ↓
Extract name or use "Anonymous"
    ↓
Display in UI
```

---

## Privacy Levels

### Level 1: Full Visibility (Default)
- ✅ Name shown in messages
- ✅ Appears on leaderboard
- ✅ Progress visible to all members

### Level 2: Leaderboard Opt-Out
- ✅ Name shown as "Anonymous" in messages
- ❌ Hidden from leaderboard
- ⚠️ Still counted in member count

### Level 3: Leave Circle (Future)
- ❌ No visibility at all
- ❌ Messages removed or anonymized
- ❌ Not counted in member count

---

## Backend Population

### Mongoose Population:
```javascript
const circle = await CommunityCircle.findById(circleId)
  .populate('createdBy', 'name')
  .populate('members.userId', 'name')
  .populate('messages.userId', 'name'); // ← Populates user names
```

### What Gets Populated:
- `createdBy` → User object with name
- `members.userId` → User object with name
- `messages.userId` → User object with name

---

## Type Safety

### TypeScript Types:
```typescript
export interface CircleMessage {
  _id: string;
  userId: string | { _id: string; name: string }; // Union type
  content: string;
  createdAt: Date;
  reported: boolean;
  reportedBy: string[];
  name?: string; // Fallback
}
```

### Type Guards:
```typescript
// Check if userId is populated object
if (typeof message.userId === 'object' && message.userId?.name) {
  // Use message.userId.name
} else {
  // Use fallback
}
```

---

## Testing Scenarios

### Test Case 1: Normal User
- ✅ Posts message → Name shows correctly
- ✅ Appears on leaderboard
- ✅ Name visible to all members

### Test Case 2: Opted-Out User
- ✅ Posts message → Shows as "Anonymous"
- ✅ Hidden from leaderboard
- ✅ Can still participate in circle

### Test Case 3: Toggle Privacy
- ✅ Opt out → Messages become anonymous
- ✅ Opt in → Messages show real name again
- ✅ Setting persists across sessions

### Test Case 4: New User
- ✅ First message → Name populated correctly
- ✅ No "Unknown User" errors
- ✅ Default visibility setting applied

---

## Privacy Best Practices

### What We Do:
1. ✅ **Respect user preferences** - Honor opt-out settings
2. ✅ **Consistent anonymization** - Apply across all features
3. ✅ **Clear controls** - Easy to understand and toggle
4. ✅ **Persistent settings** - Saved in database
5. ✅ **Graceful fallbacks** - "Anonymous" instead of errors

### What We Don't Do:
1. ❌ **Expose opted-out users** - Never show their data
2. ❌ **Track without consent** - Respect privacy choices
3. ❌ **Share data externally** - Keep within circle
4. ❌ **Make privacy hard** - Simple toggle controls

---

## Future Enhancements

### Potential Privacy Features:
1. **Granular Controls**
   - Separate settings for messages vs leaderboard
   - Choose what data to share

2. **Anonymous Mode**
   - Post messages without any identifier
   - Complete privacy option

3. **Data Retention**
   - Auto-delete old messages
   - Export personal data

4. **Visibility Levels**
   - Public, Friends Only, Private
   - Custom visibility per circle

5. **Privacy Dashboard**
   - See all privacy settings
   - Manage data sharing
   - Review what's visible

---

## API Endpoints

### Toggle Leaderboard Visibility:
```
PUT /api/community/:circleId/leaderboard/opt-out

Response:
{
  "success": true,
  "message": "Leaderboard visibility disabled",
  "data": {
    "optOutOfLeaderboard": true
  }
}
```

### Get Circle (with privacy applied):
```
GET /api/community/:circleId

Response:
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "...",
        "userId": {
          "_id": "...",
          "name": "Anonymous"  // ← Anonymized
        },
        "content": "Hello!",
        "createdAt": "..."
      }
    ]
  }
}
```

---

## Summary

### Fixed Issues:
- ✅ "Unknown User" → Shows correct names
- ✅ No privacy controls → Leaderboard opt-out
- ✅ Inconsistent display → Unified logic

### Privacy Features:
- ✅ Leaderboard opt-out toggle
- ✅ Automatic anonymization
- ✅ Persistent settings
- ✅ Clear UI controls

### User Benefits:
- 🔒 Control over visibility
- 👤 Choose to be anonymous
- 🛡️ Privacy-first design
- ⚙️ Easy to manage

All privacy features respect user choices and provide clear, simple controls! 🔐✨
