# Community Privacy Restrictions Implementation

## Overview
Implement privacy controls that restrict community features based on user's `privacySettings.shareWithCommunity` preference.

## Privacy Settings in User Model

```javascript
privacySettings: {
  shareWithCommunity: Boolean (default: true),
  showOnLeaderboard: Boolean (default: true),
  habitDataSharing: Boolean (default: false),
  profileVisibility: String (public/friends/private, default: private)
}
```

## Privacy Restrictions to Implement

### When `shareWithCommunity = false`:

#### 1. **Cannot Join or Create Circles**
- Hide "Community" navigation link
- Block access to community pages
- Show privacy message if accessed directly

#### 2. **Cannot View Circles**
- No access to circle list
- No access to circle details
- Cannot search for circles

#### 3. **Cannot Participate in Challenges**
- Cannot join challenges
- Cannot view challenge progress
- Cannot earn community points

#### 4. **Cannot Post Messages**
- Cannot send messages in circles
- Cannot view circle messages

#### 5. **Cannot View Leaderboards**
- Cannot see circle leaderboards
- Cannot see own ranking

### When `showOnLeaderboard = false` (but `shareWithCommunity = true`):

#### 1. **Can Join Circles**
- Can join and participate in circles
- Can post messages
- Can view announcements

#### 2. **Hidden from Leaderboard**
- Name shows as "Anonymous"
- Stats not displayed
- Already implemented via `optOutOfLeaderboard`

## Implementation Plan

### 1. Backend Middleware

Create middleware to check community access:

```javascript
// middleware/communityAccess.js
export const checkCommunityAccess = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  if (!user.privacySettings.shareWithCommunity) {
    return res.status(403).json({
      success: false,
      message: 'Community features are disabled in your privacy settings',
      code: 'COMMUNITY_DISABLED'
    });
  }
  
  next();
};
```

### 2. Apply Middleware to Community Routes

```javascript
// routes/community.js
import { checkCommunityAccess } from '../middleware/communityAccess.js';

// Apply to all community routes
router.use(checkCommunityAccess);

router.post('/', createCircle);
router.get('/', getCircles);
// ... all other routes
```

### 3. Frontend Privacy Check

Create a hook to check community access:

```typescript
// hooks/useCommunityAccess.ts
export const useCommunityAccess = () => {
  const { user } = useAuth();
  
  const canAccessCommunity = user?.privacySettings?.shareWithCommunity ?? true;
  const showOnLeaderboard = user?.privacySettings?.showOnLeaderboard ?? true;
  
  return {
    canAccessCommunity,
    showOnLeaderboard,
    isRestricted: !canAccessCommunity
  };
};
```

### 4. Conditional Navigation

Update Sidebar/Navbar to hide community link:

```typescript
// components/layout/Sidebar.tsx
const { canAccessCommunity } = useCommunityAccess();

{canAccessCommunity && (
  <NavLink to="/community">
    <Users className="w-5 h-5" />
    Community
  </NavLink>
)}
```

### 5. Route Protection

Add privacy check to community routes:

```typescript
// routes/AppRoutes.tsx
<Route
  path="/community/*"
  element={
    <ProtectedRoute>
      <CommunityAccessGuard>
        <CommunityRoutes />
      </CommunityAccessGuard>
    </ProtectedRoute>
  }
/>
```

### 6. Privacy Message Component

Create component to show when access is restricted:

```typescript
// components/community/CommunityDisabledMessage.tsx
export const CommunityDisabledMessage = () => {
  return (
    <Card className="p-8 text-center">
      <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h2 className="text-2xl font-bold mb-2">Community Features Disabled</h2>
      <p className="text-gray-600 mb-6">
        You've disabled community features in your privacy settings.
        Enable them to join circles, participate in challenges, and connect with others.
      </p>
      <Button onClick={() => navigate('/settings/privacy')}>
        Update Privacy Settings
      </Button>
    </Card>
  );
};
```

## Files to Modify

### Backend:
1. ✅ `server/src/middleware/communityAccess.js` - Create new
2. ✅ `server/src/routes/community.js` - Add middleware
3. ✅ `server/src/controllers/communityController.js` - Add privacy checks

### Frontend:
1. ✅ `src/hooks/useCommunityAccess.ts` - Create new
2. ✅ `src/components/community/CommunityAccessGuard.tsx` - Create new
3. ✅ `src/components/community/CommunityDisabledMessage.tsx` - Create new
4. ✅ `src/components/layout/Sidebar.tsx` - Conditional rendering
5. ✅ `src/components/layout/Navbar.tsx` - Conditional rendering
6. ✅ `src/routes/AppRoutes.tsx` - Add route guard

## Privacy Settings UI

Ensure privacy settings page clearly explains:

```typescript
<Checkbox
  checked={shareWithCommunity}
  onChange={handleToggle}
  label="Enable Community Features"
  description="Allow access to community circles, challenges, and leaderboards. 
               Disabling this will hide all community features."
/>

<Checkbox
  checked={showOnLeaderboard}
  onChange={handleToggle}
  label="Show on Leaderboards"
  description="Display your name and stats on circle leaderboards. 
               You can still participate in circles with this disabled."
  disabled={!shareWithCommunity}
/>
```

## Error Handling

### Backend Error Response:
```json
{
  "success": false,
  "message": "Community features are disabled in your privacy settings",
  "code": "COMMUNITY_DISABLED",
  "action": {
    "text": "Update Privacy Settings",
    "url": "/settings/privacy"
  }
}
```

### Frontend Error Handling:
```typescript
try {
  await communityService.getCircles();
} catch (error) {
  if (error.code === 'COMMUNITY_DISABLED') {
    // Show privacy message
    setShowPrivacyMessage(true);
  }
}
```

## User Experience Flow

### Scenario 1: User Disables Community
1. User goes to Settings > Privacy
2. Unchecks "Enable Community Features"
3. Saves settings
4. Community link disappears from navigation
5. If they try to access `/community`, see privacy message
6. Can re-enable anytime

### Scenario 2: User Tries to Access While Disabled
1. User types `/community` in URL
2. Route guard checks privacy settings
3. Shows `CommunityDisabledMessage`
4. Provides button to update settings
5. Redirects to privacy settings if clicked

### Scenario 3: User in Circle Then Disables
1. User is member of circles
2. Disables community features
3. Automatically removed from all circles (optional)
4. OR: Membership preserved but cannot access (recommended)
5. Can rejoin when re-enabled

## Migration Considerations

### For Existing Users:
- Default `shareWithCommunity` to `true` (already set)
- No disruption to current community members
- Users must explicitly opt-out

### For New Users:
- Show privacy onboarding
- Explain community features
- Let them choose preferences upfront

## Testing Checklist

### Backend:
- [ ] Middleware blocks requests when disabled
- [ ] Returns proper error code
- [ ] Allows requests when enabled
- [ ] Works with all community endpoints

### Frontend:
- [ ] Navigation link hidden when disabled
- [ ] Route guard redirects properly
- [ ] Privacy message displays correctly
- [ ] Settings toggle works
- [ ] Re-enabling restores access

### Integration:
- [ ] Disabling removes from leaderboards
- [ ] Cannot join new circles
- [ ] Cannot post messages
- [ ] Cannot join challenges
- [ ] Can re-enable and rejoin

## Benefits

✅ **User Control**: Users decide their community participation
✅ **Privacy Compliance**: Respects data sharing preferences
✅ **Clear Communication**: Users understand what's disabled
✅ **Easy Toggle**: Can enable/disable anytime
✅ **Graceful Degradation**: App works fine without community
✅ **Consistent Experience**: Same restrictions across all features

## Next Steps

1. Create backend middleware
2. Apply to community routes
3. Create frontend hook
4. Add route guard
5. Update navigation
6. Create privacy message component
7. Test all scenarios
8. Update privacy settings UI

Would you like me to implement these privacy restrictions now?
