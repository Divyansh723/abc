# Forgiveness Token System - Implementation Complete

## Overview
The forgiveness token system has been successfully implemented to help users maintain their habit streaks when they miss a day. Users start with 3 tokens and can use them strategically to prevent streak breaks.

## What Was Implemented

### 1. Backend Implementation ✅

#### Database Schema
- **User Model** (`server/src/models/User.js`):
  - Added `forgivenessTokens` field (Number, default: 3, min: 0, max: 3)
  
- **Completion Model** (`server/src/models/Completion.js`):
  - Added `forgivenessUsed` field (Boolean, default: false)
  - Tracks which completions were created using forgiveness tokens

#### API Endpoints
- **POST `/api/gamification/forgiveness`** - Use a forgiveness token
  - Deducts 1 token from user
  - Creates a completion entry with `forgivenessUsed: true`
  - Awards 10 XP (standard completion XP)
  - Returns remaining token count

- **POST `/api/habits/:habitId/forgiveness`** - Alternative endpoint via habits route
  - Same functionality as above
  - Integrated with habit completion flow

#### Controllers
- **`gamificationController.js`**:
  - `useForgivenessToken()` - Handles token usage with transaction support
  - `getGamificationData()` - Returns current token count with other gamification data

- **`habitController.js`**:
  - `useForgiveness()` - Habit-specific forgiveness token usage
  - Updates habit streaks after forgiveness completion

### 2. Frontend Implementation ✅

#### Services
- **`gamificationService.ts`**:
  - `useForgivenessToken()` - API call to use a token
  - Returns completion data and remaining tokens
  - Includes mock implementation for development

- **`habitService.ts`**:
  - `useForgivenessToken()` - Habit-specific token usage
  - Integrated with habit completion flow

#### Hooks
- **`useForgivenessTokens.ts`** (NEW):
  - `tokens` - Current token count
  - `maxTokens` - Maximum tokens (3)
  - `isLoading` - Loading state
  - `error` - Error message
  - `useToken(habitId, date, timezone)` - Use a token
  - `canUseToken()` - Check if tokens are available

#### Components
- **`ForgivenessToken.tsx`**:
  - Visual display of available tokens (heart icons)
  - Shows token count (e.g., "2/2")
  - Modal for confirming token usage
  - Helpful information about token rules
  - Responsive design with dark mode support

#### UI Integration
- **Goals Page** (`GoalsPage.tsx`):
  - Added forgiveness token card to quick stats section
  - Shows current token count
  - Displays token visual indicators
  - Integrated with useForgivenessTokens hook

### 3. User Types ✅
- **`user.ts`**:
  - Added `forgivenessTokens: number` to User interface
  - Properly typed across the application

## How It Works

### Token Rules
1. **Starting Tokens**: Users start with 3 forgiveness tokens
2. **Token Usage**: Can be used to maintain streaks when habits are missed
3. **Token Limit**: Maximum of 3 tokens at any time
4. **XP Award**: Using a token awards 10 XP (same as regular completion)
5. **Streak Protection**: Tokens maintain streaks without breaking them

### User Flow
1. User misses a habit day
2. User navigates to Goals page or habit details
3. User sees available forgiveness tokens
4. User clicks "Use Token" button
5. Confirmation modal appears with token information
6. User confirms token usage
7. System:
   - Deducts 1 token
   - Creates forgiveness completion
   - Maintains habit streak
   - Awards 10 XP
   - Updates UI with new token count

### Visual Design
- **Token Icon**: Heart (❤️) - represents compassion/forgiveness
- **Color Scheme**: Pink/Red gradient - warm and forgiving
- **Filled vs Empty**: Visual distinction between available and used tokens
- **Token Count**: Clear display (e.g., "2/3")

## API Examples

### Use Forgiveness Token
```javascript
POST /api/gamification/forgiveness
Content-Type: application/json
Authorization: Bearer <token>

{
  "habitId": "507f1f77bcf86cd799439011",
  "date": "2024-11-10T00:00:00.000Z",
  "timezone": "America/New_York"
}

Response:
{
  "success": true,
  "data": {
    "completion": {
      "id": "507f1f77bcf86cd799439012",
      "habitId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439010",
      "completedAt": "2024-11-10T00:00:00.000Z",
      "xpEarned": 10,
      "forgivenessUsed": true,
      "deviceTimezone": "America/New_York"
    },
    "remainingTokens": 2,
    "newTotalXP": 1260
  }
}
```

### Get Gamification Data (includes tokens)
```javascript
GET /api/gamification/data
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalXP": 1250,
    "currentLevel": 4,
    "xpForCurrentLevel": 900,
    "xpForNextLevel": 1600,
    "progressPercentage": 50,
    "forgivenessTokens": 2,  // <-- Token count included
    "achievements": [...],
    "challengeParticipations": [...],
    "recentTransactions": [...]
  }
}
```

## Frontend Usage

### Using the Hook
```typescript
import { useForgivenessTokens } from '@/hooks/useForgivenessTokens';

function MyComponent() {
  const { tokens, maxTokens, useToken, canUseToken, isLoading, error } = useForgivenessTokens();

  const handleUseToken = async () => {
    if (!canUseToken()) {
      alert('No tokens available');
      return;
    }

    try {
      await useToken('habitId123', new Date(), 'America/New_York');
      alert('Token used successfully!');
    } catch (error) {
      console.error('Failed to use token:', error);
    }
  };

  return (
    <div>
      <p>Tokens: {tokens}/{maxTokens}</p>
      <button onClick={handleUseToken} disabled={!canUseToken() || isLoading}>
        Use Token
      </button>
    </div>
  );
}
```

### Using the Component
```typescript
import { ForgivenessToken } from '@/components/gamification/ForgivenessToken';
import { useForgivenessTokens } from '@/hooks/useForgivenessTokens';

function MyPage() {
  const { tokens, useToken } = useForgivenessTokens();

  return (
    <ForgivenessToken
      available={tokens}
      onUse={useToken}
      className="my-4"
    />
  );
}
```

## Testing

### Manual Testing Steps
1. **View Tokens**:
   - Navigate to Goals page
   - Check quick stats section
   - Verify token count displays correctly

2. **Use Token**:
   - Miss a habit day
   - Click "Use Token" button
   - Confirm in modal
   - Verify token count decreases
   - Verify streak is maintained

3. **Token Limits**:
   - Use all 3 tokens
   - Verify "Use Token" button is disabled
   - Verify appropriate message is shown

4. **XP Award**:
   - Use a token
   - Check XP increased by 10
   - Verify XP transaction is logged

### API Testing
```bash
# Test using forgiveness token
curl -X POST http://localhost:8000/api/gamification/forgiveness \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "habitId": "HABIT_ID",
    "date": "2024-11-10T00:00:00.000Z",
    "timezone": "UTC"
  }'

# Check gamification data
curl -X GET http://localhost:8000/api/gamification/data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Future Enhancements

### Potential Features
1. **Token Earning**:
   - Earn tokens by completing habits consistently
   - Bonus tokens for long streaks
   - Monthly token refresh

2. **Token Expiry**:
   - Tokens expire after certain period
   - Use-it-or-lose-it mechanic

3. **Premium Tokens**:
   - Special tokens with enhanced benefits
   - Can be purchased or earned through achievements

4. **Token History**:
   - Track when and how tokens were used
   - Analytics on token usage patterns

5. **Token Sharing**:
   - Gift tokens to community members
   - Token marketplace

6. **Habit-Specific Tokens**:
   - Tokens that work only for certain habits
   - Category-specific tokens

### Analytics Opportunities
1. **Usage Patterns**:
   - When do users use tokens most?
   - Which habits benefit most from tokens?
   - Correlation between token usage and retention

2. **Effectiveness**:
   - Do tokens help maintain long-term engagement?
   - Impact on streak lengths
   - User satisfaction metrics

## Files Modified/Created

### Created
- `src/hooks/useForgivenessTokens.ts` - Hook for managing forgiveness tokens
- `FORGIVENESS_TOKEN_IMPLEMENTATION_COMPLETE.md` - This documentation

### Modified
- `server/src/models/User.js` - Added forgivenessTokens field
- `server/src/models/Completion.js` - Added forgivenessUsed field
- `server/src/controllers/gamificationController.js` - Added useForgivenessToken endpoint
- `server/src/controllers/habitController.js` - Added useForgiveness endpoint
- `src/services/gamificationService.ts` - Added useForgivenessToken method
- `src/services/habitService.ts` - Added useForgivenessToken method
- `src/components/gamification/ForgivenessToken.tsx` - Updated component interface
- `src/pages/GoalsPage.tsx` - Added forgiveness token display
- `src/types/user.ts` - Already had forgivenessTokens field

## Status: ✅ COMPLETE

The forgiveness token system is fully implemented and ready for testing. Users can now:
- View their available forgiveness tokens
- Use tokens to maintain streaks
- See visual feedback on token usage
- Track token count across the application

The system is compassionate, strategic, and adds a valuable safety net for users building consistent habits.

---

**Implementation Date**: November 10, 2024  
**Status**: Complete and Ready for Testing  
**Impact**: Enhanced user experience with streak protection
