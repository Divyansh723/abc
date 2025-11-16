# AI Privacy Controls Implementation

## Overview
This document explains how AI privacy controls are implemented in HabitForge, ensuring users have full control over their data and AI features.

## Features Implemented

### 1. Backend Enforcement
**Location:** `server/src/controllers/aiController.js`

All AI endpoints now check the user's `allowAIPersonalization` setting before processing requests:

- `GET /api/ai/insights` - AI habit insights
- `POST /api/ai/suggestions` - Habit suggestions
- `GET /api/ai/patterns/:habitId` - Pattern analysis
- `GET /api/ai/motivation` - Motivational content (with logging)
- `POST /api/ai/coaching` - Personalized coaching (with logging)
- `GET /api/ai/mood-correlation` - Mood-habit correlation

**Behavior:**
- If `allowAIPersonalization === false`, returns `403 Forbidden` with code `AI_DISABLED`
- Response includes `settingsPath: '/settings'` to guide users
- Coaching endpoints still log the denial for audit purposes

### 2. Frontend Permission System
**Location:** `src/hooks/useAIPermissions.ts`

Custom hook that provides permission checks throughout the app:

```typescript
const permissions = useAIPermissions();

permissions.isAIEnabled           // Overall AI toggle
permissions.canUseAIInsights      // Habit insights
permissions.canUseAISuggestions   // Habit suggestions
permissions.canUseAICoaching      // Coaching messages
permissions.canUsePatternAnalysis // Pattern analysis
permissions.canUseMoodCorrelation // Mood correlation
permissions.isCommunityEnabled    // Community features
permissions.canJoinCommunity      // Join circles
permissions.canShowOnLeaderboard  // Leaderboard visibility
```

### 3. Conditional UI Rendering
**Location:** `src/pages/InsightsPage.tsx`

The Insights page now:
- Checks AI permissions before loading data
- Shows `AIDisabledMessage` component if AI is disabled
- Prevents unnecessary API calls when AI is off
- Provides clear path to enable AI features

### 4. AI Disabled Message Component
**Location:** `src/components/ai/AIDisabledMessage.tsx`

User-friendly component that:
- Explains why AI features are unavailable
- Provides direct link to Privacy Settings
- Reassures users about privacy control
- Uses clear, non-technical language

### 5. Fixed Checkbox State Management
**Location:** `src/components/settings/PrivacySettings.tsx`

**Problem Fixed:**
- Checkboxes were using `||` operator which treated `false` as falsy
- This caused `false` values to be replaced with default values
- Checkboxes wouldn't properly reflect disabled state

**Solution:**
- Changed from `||` to `??` (nullish coalescing operator)
- Now correctly handles `false` values
- Checkboxes properly sync with database state

**Before:**
```typescript
aiPersonalization: user.privacySettings.allowAIPersonalization || true
// If allowAIPersonalization is false, this becomes true!
```

**After:**
```typescript
aiPersonalization: user.privacySettings.allowAIPersonalization ?? true
// If allowAIPersonalization is false, it stays false
```

## Privacy Settings Impact

### AI Personalization (`allowAIPersonalization`)

**When DISABLED (`false`):**
- ❌ AI Insights page shows disabled message
- ❌ All AI API endpoints return 403 error
- ❌ Personalized coaching unavailable
- ❌ Habit suggestions unavailable
- ❌ Pattern analysis unavailable
- ❌ Mood correlation unavailable
- ✅ Basic habit tracking still works
- ✅ Manual analytics still work
- ✅ Gamification (XP, levels) still works

**When ENABLED (`true` - default):**
- ✅ All AI features available
- ✅ Personalized insights and coaching
- ✅ Data used for personalization
- ✅ AI interaction logging active

### Community Participation (`shareWithCommunity`)

**When DISABLED (`false`):**
- ❌ Cannot join community circles
- ❌ Hidden from leaderboards
- ❌ Cannot participate in community challenges
- ✅ Personal challenges still work
- ✅ All other features work

**When ENABLED (`true` - default):**
- ✅ Can join community circles
- ✅ Appears on leaderboards (if `showOnLeaderboard` is true)
- ✅ Can participate in community features

### Show on Leaderboard (`showOnLeaderboard`)

**When DISABLED (`false`):**
- ❌ User's name/stats hidden from leaderboards
- ✅ Can still view leaderboards
- ✅ Can still participate in community

**When ENABLED (`true` - default):**
- ✅ Visible on leaderboards
- ✅ Stats shared with community

## User Experience Flow

### First-Time User
1. Default: AI enabled, Community enabled
2. Can opt-out anytime in Settings
3. Changes take effect immediately

### Disabling AI Features
1. User goes to Settings → Privacy
2. Unchecks "AI Personalization"
3. Clicks "Save Privacy Settings"
4. Success message confirms save
5. Next visit to Insights page shows disabled message
6. All AI API calls return 403

### Re-enabling AI Features
1. User sees "AI Disabled" message on Insights page
2. Clicks "Go to Privacy Settings" button
3. Checks "AI Personalization" checkbox
4. Clicks "Save Privacy Settings"
5. Returns to Insights page
6. AI features load normally

## Technical Implementation Details

### Backend Middleware
```javascript
// Check in controller before processing
if (req.user.privacySettings && 
    req.user.privacySettings.allowAIPersonalization === false) {
  return res.status(403).json({
    success: false,
    message: 'AI personalization is disabled',
    code: 'AI_DISABLED',
    settingsPath: '/settings'
  });
}
```

### Frontend Permission Check
```typescript
// In component
const permissions = useAIPermissions();

if (!permissions.isAIEnabled) {
  return <AIDisabledMessage />;
}
```

### Error Handling
```typescript
// In AI service
if (axios.isAxiosError(error) && error.response?.status === 403) {
  const errorData = error.response.data;
  if (errorData.code === 'AI_DISABLED') {
    throw new Error('AI_DISABLED');
  }
}
```

## Database Schema

### User Model Privacy Settings
```javascript
privacySettings: {
  shareWithCommunity: Boolean,      // Community features
  allowAIPersonalization: Boolean,  // AI features
  showOnLeaderboard: Boolean,       // Leaderboard visibility
  profileVisibility: String,        // public/friends/private
  habitDataSharing: Boolean,        // Research data
  analyticsSharing: Boolean,        // Usage analytics
  thirdPartySharing: Boolean,       // External integrations
  marketingEmails: Boolean,         // Marketing communications
  dataRetention: String             // 6months/1year/2years/indefinite
}
```

## Testing Checklist

- [x] Backend returns 403 when AI disabled
- [x] Frontend shows disabled message when AI off
- [x] Checkboxes properly reflect database state
- [x] Checkboxes update correctly when toggled
- [x] Save button persists changes to database
- [x] Changes take effect immediately
- [x] No unnecessary API calls when AI disabled
- [x] Clear user guidance to enable features
- [x] Proper error handling throughout

## Future Enhancements

### Potential Additions
1. **Granular AI Controls** - Separate toggles for insights vs coaching vs suggestions
2. **Consent History** - Track when user changed settings
3. **First-Time Consent Flow** - Modal for new users explaining AI features
4. **Data Usage Dashboard** - Show what data AI has accessed
5. **Temporary AI Enable** - "Try AI for 7 days" option
6. **AI Training Data Consent** - Separate toggle for using data to improve AI models

## Compliance

### GDPR Considerations
- ✅ Users can opt-out of AI processing
- ✅ Clear explanation of what AI does
- ✅ Easy access to privacy controls
- ✅ Changes take effect immediately
- ✅ No AI processing when disabled
- ⚠️ Need: Consent history tracking
- ⚠️ Need: Data processing agreements

### Privacy-First Design
- Default settings are privacy-conscious
- Clear language (no legal jargon)
- One-click disable/enable
- No dark patterns
- Transparent about data usage

## Support

### User Questions

**Q: What happens to my data when I disable AI?**
A: Your data stays in your account, but AI won't analyze it. You can re-enable anytime.

**Q: Can I use some AI features but not others?**
A: Currently it's all-or-nothing. Granular controls coming in future update.

**Q: Will disabling AI affect my habits or streaks?**
A: No! All habit tracking, streaks, XP, and levels work normally.

**Q: How do I know AI is really disabled?**
A: The Insights page will show a "AI Disabled" message, and AI API calls return 403 errors.

## Maintenance

### Adding New AI Features
When adding new AI-powered features:

1. Add permission check in backend controller
2. Add permission property to `useAIPermissions` hook
3. Check permission before rendering component
4. Show `AIDisabledMessage` or hide feature when disabled
5. Update this documentation

### Modifying Privacy Settings
When adding new privacy settings:

1. Add field to User model `privacySettings`
2. Add to `PrivacySettings` component UI
3. Add to `useAIPermissions` hook if needed
4. Update save handler
5. Test checkbox state management
6. Update documentation
