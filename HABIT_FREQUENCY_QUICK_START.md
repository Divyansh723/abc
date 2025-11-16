# Habit Frequency Improvements - Quick Start Guide

## 🚀 What's New?

The habit system now supports three distinct frequency types with proper completion restrictions:

1. **Daily Habits** - Complete once per day
2. **Weekly Habits** - Complete once per week (Sunday-Saturday)
3. **Custom Habits** - Complete on specific days you choose

## 📝 Creating Habits

### Daily Habit
```
1. Click "Add Habit"
2. Set Frequency to "Daily"
3. Fill in other details
4. Save
```
- Can be completed once per day
- Resets at midnight
- Streak counts consecutive days

### Weekly Habit
```
1. Click "Add Habit"
2. Set Frequency to "Weekly"
3. Fill in other details
4. Save
```
- Can be completed once per week
- Week runs Sunday-Saturday
- Resets every Sunday
- Streak counts consecutive weeks

### Custom Habit
```
1. Click "Add Habit"
2. Set Frequency to "Custom"
3. Select specific days (e.g., Mon, Wed, Fri)
4. Fill in other details
5. Save
```
- Only appears on selected days
- Can be completed once per selected day
- Streak counts consecutive occurrences of selected days
- Must select at least one day

## 🎯 Using the Dashboard

### What You'll See
- **Today's Habits**: Only habits relevant for today
- **Custom Habits**: Only show on their selected days
- **Completion Status**: Clear indicators for each habit type

### Completion States

**Available to Complete:**
- Green "Complete" button
- Click to mark as done

**Already Completed:**
- Green checkmark with "Completed" badge
- Shows when completed (today/this week)
- Click to undo if needed

**Not Available:**
- Disabled button with clock icon
- Shows "Not Today" for custom habits on wrong days
- Displays when habit will be available

## 📊 Streaks & Stats

### Daily Habits
- **Streak**: Consecutive days completed
- **Consistency**: % of last 30 days completed
- Breaks if you miss a day

### Weekly Habits
- **Streak**: Consecutive weeks completed
- **Consistency**: % of weeks completed in last 30 days
- Breaks if you miss a week

### Custom Habits
- **Streak**: Consecutive selected days completed
- **Consistency**: % of selected days completed in last 30 days
- Only counts your selected days (e.g., if you pick Mon/Wed/Fri, only those days matter)

## 🧪 Testing the Feature

### Run Automated Tests
```bash
cd server
node test-habit-frequency.js
```

This will test:
- Daily habit restrictions
- Weekly habit restrictions
- Custom habit day filtering
- Streak calculations
- Consistency rates

### Manual Testing

**Test Daily Habit:**
1. Create a daily habit
2. Complete it ✅
3. Try to complete again (should fail) ❌
4. Wait until tomorrow and complete again ✅

**Test Weekly Habit:**
1. Create a weekly habit
2. Complete it on Monday ✅
3. Try to complete on Tuesday (should fail) ❌
4. Wait until next Sunday and complete again ✅

**Test Custom Habit:**
1. Create custom habit for Mon/Wed/Fri
2. On Monday: habit appears, can complete ✅
3. On Tuesday: habit doesn't appear ✅
4. On Wednesday: habit appears again ✅

## 🐛 Troubleshooting

### "Habit not showing on dashboard"
- Check if it's a custom habit
- Verify today is one of the selected days
- Ensure habit is active (not archived)

### "Can't complete habit"
- Daily: Already completed today?
- Weekly: Already completed this week?
- Custom: Is today a selected day?

### "Streak seems wrong"
- Daily: Counts consecutive days
- Weekly: Counts consecutive weeks (not days)
- Custom: Only counts selected days

### "Consistency rate unexpected"
- Daily: Based on 30 days
- Weekly: Based on weeks in 30-day period
- Custom: Based on selected days in 30-day period

## 💡 Tips & Best Practices

### For Daily Habits
- Use for things you want to do every single day
- Examples: meditation, journaling, vitamins

### For Weekly Habits
- Use for things you do once per week
- Examples: weekly review, meal prep, laundry
- Complete anytime during the week

### For Custom Habits
- Use for specific schedules
- Examples: gym (Mon/Wed/Fri), therapy (Thursdays), team meetings
- Only shows on relevant days to reduce clutter

### Maximizing Streaks
- Daily: Don't miss any days
- Weekly: Complete at least once per week
- Custom: Complete on every selected day

## 🔧 API Reference

### Validation Functions
```javascript
// Check if habit can be completed
const validation = await canCompleteHabit(habit, userId, date, timezone);
// Returns: { canComplete: boolean, reason?: string }
```

### Streak Calculation
```javascript
// Calculate frequency-aware streak
const { currentStreak, longestStreak } = calculateHabitStreak(habit, completions, timezone);
```

### Consistency Rate
```javascript
// Calculate frequency-aware consistency
const rate = calculateConsistencyRate(habit, completions, daysToCheck, timezone);
// Returns: percentage (0-100)
```

## 📚 Additional Resources

- Full implementation details: `HABIT_FREQUENCY_COMPLETE.md`
- Task breakdown: `.kiro/specs/habit-frequency-improvements/tasks.md`
- Requirements: `.kiro/specs/habit-frequency-improvements/requirements.md`
- Design doc: `.kiro/specs/habit-frequency-improvements/design.md`

## 🎉 Ready to Use!

The feature is fully implemented and ready for production. Start creating habits with custom schedules today!
