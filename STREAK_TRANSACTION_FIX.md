# Streak Calculation Transaction Fix

## Issue

Even after reordering the operations to save the completion before calculating the streak, new habits still showed streak = 0 after refresh. The "Fix Streaks" button was needed to correct it.

## Root Cause

The `calculateStreak()` method was querying the database WITHOUT using the MongoDB session parameter. This meant it couldn't see the completion that was just saved within the transaction, because:

1. The completion was saved with `session` (inside transaction)
2. The `calculateStreak()` query ran WITHOUT `session` (outside transaction)
3. MongoDB transactions isolate changes until committed
4. The query couldn't see uncommitted changes from the transaction

## Solution

Modified the `calculateStreak()` method to accept and use an optional session parameter, allowing it to see uncommitted changes within a transaction.

## Code Changes

### File: `server/src/models/Habit.js`

**Before:**
```javascript
habitSchema.methods.calculateStreak = async function() {
  const Completion = mongoose.model('Completion');
  
  // Get completions for this habit
  const completions = await Completion.find({ 
    habitId: this._id 
  }).sort({ completedAt: -1 });
  // ❌ Query runs outside transaction, can't see new completion
```

**After:**
```javascript
habitSchema.methods.calculateStreak = async function(session = null) {
  const Completion = mongoose.model('Completion');
  
  // Get completions for this habit
  const query = Completion.find({ 
    habitId: this._id 
  }).sort({ completedAt: -1 });
  
  // ✅ Use session if provided to see uncommitted changes
  if (session) {
    query.session(session);
  }
  
  const completions = await query;
```

### File: `server/src/controllers/habitController.js`

**Before:**
```javascript
// NOW calculate streak with the new completion included
await habit.calculateStreak();
// ❌ No session passed, can't see the completion
```

**After:**
```javascript
// NOW calculate streak with the new completion included
// Pass session so it can see the completion we just saved
await habit.calculateStreak(session);
// ✅ Session passed, can see uncommitted completion
```

## How MongoDB Transactions Work

MongoDB transactions provide ACID guarantees:

1. **Atomicity:** All operations succeed or all fail
2. **Consistency:** Data remains valid
3. **Isolation:** Changes invisible to other operations until committed
4. **Durability:** Committed changes persist

### The Isolation Problem

```javascript
// Inside transaction with session
await completion.save({ session }); // ✅ Saved in transaction

// Query WITHOUT session
const completions = await Completion.find({ habitId }); 
// ❌ Can't see completion saved in transaction!

// Query WITH session
const completions = await Completion.find({ habitId }).session(session);
// ✅ Can see completion saved in transaction!
```

## Testing Scenarios

### Scenario 1: New Habit First Completion
1. Create a new habit
2. Immediately complete it
3. **Expected:** Streak shows as 1 immediately
4. **Result:** ✅ Works correctly
5. Refresh page
6. **Expected:** Streak still shows as 1
7. **Result:** ✅ Works correctly

### Scenario 2: Consecutive Day Completions
1. Complete habit today (streak = 1)
2. Complete habit tomorrow (streak = 2)
3. **Expected:** Streak increments correctly
4. **Result:** ✅ Works correctly

### Scenario 3: Transaction Rollback
1. Start completing a habit
2. Error occurs during transaction
3. **Expected:** No completion saved, streak unchanged
4. **Result:** ✅ Works correctly (transaction rolls back)

### Scenario 4: Concurrent Completions
1. User completes habit in two browser tabs simultaneously
2. **Expected:** Only one completion saved, proper error handling
3. **Result:** ✅ Works correctly (duplicate check prevents double completion)

## Impact

- ✅ Streaks calculate correctly for new habits immediately
- ✅ No need to click "Fix Streaks" button
- ✅ Streaks persist correctly after refresh
- ✅ Transaction integrity maintained
- ✅ XP bonuses calculate with correct streak values
- ✅ No breaking changes to existing functionality

## Files Modified

1. `server/src/models/Habit.js` - Added session parameter to `calculateStreak()`
2. `server/src/controllers/habitController.js` - Pass session to `calculateStreak()`

## Backward Compatibility

The `session` parameter is optional (defaults to `null`), so:
- ✅ Existing calls without session still work
- ✅ New calls with session see transaction changes
- ✅ No breaking changes to API

## Related Systems

This fix ensures proper integration with:
- **Gamification System:** XP calculations use correct streaks
- **Analytics:** Streak statistics are accurate immediately
- **UI Updates:** Optimistic updates match server reality
- **Notifications:** Streak milestone notifications trigger correctly
- **Forgiveness Tokens:** Streak recovery works properly

## Performance Considerations

- **No Performance Impact:** Same query, just with session parameter
- **Transaction Efficiency:** No additional queries
- **Memory Usage:** Minimal (session reference only)

## MongoDB Best Practices

This fix follows MongoDB transaction best practices:

1. ✅ Use sessions for all operations in a transaction
2. ✅ Pass session to all queries that need to see uncommitted changes
3. ✅ Make session parameter optional for backward compatibility
4. ✅ Handle errors and rollback properly

## Future Improvements

Potential enhancements:
1. Add session parameter to other stat calculation methods
2. Implement optimistic locking for concurrent updates
3. Add retry logic for transaction conflicts
4. Cache streak calculations for better performance
5. Add database indexes for faster streak queries

## Conclusion

The streak calculation now works correctly by using MongoDB sessions to see uncommitted changes within transactions. This eliminates the need for the "Fix Streaks" button and ensures streaks are accurate immediately after completion.

## Key Takeaway

**When using MongoDB transactions, always pass the session parameter to queries that need to see uncommitted changes within the transaction.**

```javascript
// ❌ Wrong - Query can't see transaction changes
await Model.find({ ... });

// ✅ Correct - Query can see transaction changes
await Model.find({ ... }).session(session);
```
