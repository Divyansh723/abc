# Challenge Habit Deletion Synchronization

## Overview
Implemented automatic synchronization between challenge habits and challenge participation to ensure data consistency when habits or challenges are deleted.

## Features Implemented

### 1. Auto-Remove User from Challenge When Habit is Deleted
**Location**: `server/src/models/Habit.js`

When a user deletes a challenge habit, they are automatically removed from the challenge participation, allowing them to rejoin later if desired.

**Implementation**:
- Added `pre('findOneAndDelete')` hook to Habit model
- Added `pre('deleteMany')` hook to Habit model
- Hooks check if the habit is a challenge habit (`isChallengeHabit === true`)
- If yes, finds the associated circle and challenge
- Removes the user from the challenge participants array
- Logs the action for debugging

**User Flow**:
1. User joins a challenge → habit is auto-created
2. User deletes the habit from their habit list
3. System automatically removes them from challenge participants
4. User can now rejoin the challenge if they want

### 2. Delete All Participant Habits When Challenge is Deleted
**Location**: `server/src/controllers/communityController.js` - `deleteChallenge` function

When an admin deletes a challenge, all habits created for participants are automatically deleted.

**Implementation**:
- Before deleting the challenge, collects all `habitId`s from participants
- Uses `Habit.deleteMany()` to delete all associated habits
- Returns count of deleted habits in response
- Logs the deletion count for monitoring

**Admin Flow**:
1. Admin deletes a challenge
2. System finds all habits linked to that challenge
3. Deletes all those habits from all participants
4. Removes the challenge from the circle
5. Returns success with count of habits deleted

## Technical Details

### Habit Model Hooks
```javascript
// Pre-remove hook for single deletion
habitSchema.pre('findOneAndDelete', async function(next) {
  // Finds the habit being deleted
  // If it's a challenge habit, removes user from challenge
  // Saves the circle with updated participants
});

// Pre-remove hook for bulk deletion
habitSchema.pre('deleteMany', async function(next) {
  // Finds all habits being deleted
  // For each challenge habit, removes user from challenge
  // Saves circles with updated participants
});
```

### Challenge Deletion Enhancement
```javascript
export const deleteChallenge = async (req, res) => {
  // ... validation ...
  
  // Delete all habits associated with this challenge
  const habitIds = challenge.participants
    .filter(p => p.habitId)
    .map(p => p.habitId);
  
  if (habitIds.length > 0) {
    await Habit.deleteMany({
      _id: { $in: habitIds },
      isChallengeHabit: true
    });
  }
  
  // Remove challenge
  circle.challenges.pull(challengeId);
  await circle.save();
  
  // Return success with count
};
```

## Benefits

1. **Data Consistency**: No orphaned habits or challenge participations
2. **User Freedom**: Users can leave challenges by deleting the habit
3. **Clean Deletion**: Admins can delete challenges without leaving habits behind
4. **Rejoin Capability**: Users can rejoin challenges after leaving
5. **Automatic Cleanup**: No manual intervention needed

## Testing Scenarios

### Scenario 1: User Deletes Challenge Habit
- **Given**: User has joined a challenge with auto-created habit
- **When**: User deletes the habit
- **Then**: 
  - Habit is deleted
  - User is removed from challenge participants
  - User can rejoin the challenge

### Scenario 2: Admin Deletes Challenge
- **Given**: Challenge has 5 participants with habits
- **When**: Admin deletes the challenge
- **Then**:
  - All 5 habits are deleted
  - Challenge is removed from circle
  - Response shows "5 habits deleted"

### Scenario 3: User Deletes Non-Challenge Habit
- **Given**: User has a regular habit (not from challenge)
- **When**: User deletes the habit
- **Then**:
  - Habit is deleted
  - No challenge participation affected
  - Hook exits early (no challenge operations)

## Error Handling

- Hooks include try-catch blocks to prevent deletion failures
- Errors are logged to console for debugging
- Errors are passed to `next(error)` to maintain Mongoose error chain
- If hook fails, the deletion still proceeds (fail-safe approach)

## Logging

All operations are logged for monitoring:
- `Removed user {userId} from challenge {challengeId} after habit deletion`
- `Deleted {count} habits associated with challenge {challengeId}`
- `Error in habit pre-remove hook: {error}`

## Future Enhancements

1. Add notification to user when removed from challenge
2. Track challenge leave/rejoin history
3. Add option to keep habit when leaving challenge
4. Implement soft delete for habits (archive instead of delete)
5. Add analytics for challenge participation patterns
