# Mood Tracking & Habit Impact Analysis - How It Works

## Overview
The mood tracking system correlates your daily wellbeing metrics (mood, energy, stress) with your habit completions to show which habits have the most positive impact on your life.

## How the Calculation Works

### 1. Data Collection
- **Mood Entries**: You track your mood, energy (1-5), and stress (1-5) daily in the Wellbeing page
- **Habit Completions**: The system records when you complete each habit
- **Time Period**: Analysis uses the last 30 days by default

### 2. Impact Calculation (Backend Logic)

The system compares your wellbeing metrics on days when you **completed** a habit versus days when you **didn't complete** it.

#### Example Calculation:

Let's say you have a "Morning Exercise" habit:

**Days with Exercise (5 days):**
- Average Mood: 4.2
- Average Energy: 4.5
- Average Stress: 2.0

**Days without Exercise (10 days):**
- Average Mood: 3.0
- Average Energy: 3.0
- Average Stress: 3.5

**Impact Calculation:**
```javascript
moodImpact = ((4.2 - 3.0) / 3.0) * 100 = +40%
energyImpact = ((4.5 - 3.0) / 3.0) * 100 = +50%
stressImpact = ((2.0 - 3.5) / 3.5) * 100 = -43%
```

This means:
- **Mood Impact: +40%** - Your mood is 40% better on days you exercise
- **Energy Impact: +50%** - Your energy is 50% higher on days you exercise
- **Stress Impact: -43%** - Your stress is 43% lower on days you exercise (negative is good!)

### 3. Correlation Strength

The system categorizes the correlation based on the absolute percentage change:

- **Strong Correlation**: >10% change
- **Moderate Correlation**: 5-10% change
- **Weak Correlation**: <5% change

### 4. Insights Generation

Based on the calculated impacts, the system generates insights like:
- "Significantly improves mood" (if mood impact > 10%)
- "Boosts energy levels" (if energy impact > 10%)
- "Helps reduce stress" (if stress impact < -10%)

## Current Implementation Status

### What's Working:
✅ Mood entry tracking (MoodTracker component)
✅ Backend calculation logic (wellbeingController.js)
✅ Impact analysis API endpoint
✅ Visual display of impacts (HabitImpactAnalysis component)

### What Shows Demo Data:
⚠️ **The HabitImpactAnalysis component shows fallback/demo data when:**
- You haven't tracked any mood entries yet
- You haven't completed any habits yet
- There isn't enough data to calculate meaningful correlations

The demo data includes:
- Morning Exercise: +80% mood, +90% energy, -60% stress
- Meditation: +70% mood, +40% energy, -80% stress
- Social Connection: +90% mood, +30% energy, -40% stress
- Reading: +50% mood, +20% energy, -30% stress
- Healthy Eating: +60% mood, +70% energy, -20% stress

### How to Get Real Data:

1. **Track Your Mood Daily**
   - Go to Wellbeing page
   - Fill out the mood tracker (mood, energy, stress)
   - Do this for at least 4-7 days

2. **Complete Your Habits Regularly**
   - Mark habits as complete on your Dashboard
   - Try to maintain consistency for accurate correlation
   - You need at least 3 days WITH the habit and 3 days WITHOUT the habit

3. **Wait for Analysis**
   - After 4-7 days of data, the system will calculate real correlations
   - New habits will show "0%" with a note: "Need at least 4-7 days of mood tracking data"
   - Once you have enough data, you'll see your actual habit impacts

## Code Locations

### Frontend:
- **Mood Tracker**: `src/components/wellbeing/MoodTracker.tsx`
- **Habit Impact Analysis**: `src/components/wellbeing/HabitImpactAnalysis.tsx`
- **Wellbeing Hook**: `src/hooks/useWellbeing.ts`

### Backend:
- **Wellbeing Controller**: `server/src/controllers/wellbeingController.js`
  - `createMoodEntry()` - Saves mood entries
  - `getMoodEntries()` - Retrieves mood history
  - `getHabitImpactAnalysis()` - Calculates habit impacts
- **Mood Entry Model**: `server/src/models/MoodEntry.js`

### Key Backend Logic (wellbeingController.js, lines 213-289):

```javascript
// Get completions for this habit
const habitCompletions = completions.filter(c => 
  c.habitId.toString() === habit._id.toString()
);

// Get mood entries on days when habit was completed
const completionDates = habitCompletions.map(c => 
  c.completedAt.toDateString()
);
const moodOnCompletionDays = moodEntries.filter(m => 
  completionDates.includes(m.date.toDateString())
);

// Get mood entries on days when habit was NOT completed
const moodOnNonCompletionDays = moodEntries.filter(m => 
  !completionDates.includes(m.date.toDateString())
);

// Calculate average mood with and without habit
const avgMoodWithHabit = moodOnCompletionDays.reduce(
  (sum, m) => sum + m.mood, 0
) / moodOnCompletionDays.length;

const avgMoodWithoutHabit = moodOnNonCompletionDays.reduce(
  (sum, m) => sum + m.mood, 0
) / moodOnNonCompletionDays.length;

// Calculate percentage impact
moodImpact = Math.round(
  ((avgMoodWithHabit - avgMoodWithoutHabit) / avgMoodWithoutHabit) * 100
);
```

## Improvements Made

I've updated the system to require minimum data thresholds:

### Backend Changes (wellbeingController.js):
1. **Minimum 3 days of data required** - Need at least 3 days with habit completion AND 3 days without
2. **Zero values for insufficient data** - Shows 0% for all metrics when data is insufficient
3. **Data status tracking** - Returns `hasEnoughData`, `dataStatus`, `daysWithHabit`, `daysWithoutHabit`
4. **Informative insights** - Shows "Need at least 4-7 days of mood tracking data" message

### Frontend Changes (HabitImpactAnalysis.tsx):
1. **Show a "Demo Data" badge** when displaying fallback data
2. **Add an info banner** explaining how the system works and what data is needed
3. **"Analyzing..." badge** for habits with insufficient data
4. **Special UI for new habits** - Orange "Collecting Data..." box showing 0% values
5. **Provide calculation examples** in the recommendations section
6. **Make it clear** when you're seeing real data vs demo data

## Summary

The mood tracking correlation is **not random** - it's a real statistical calculation comparing your wellbeing on habit completion days vs non-completion days. However, you're currently seeing **demo/fallback data** because you need to:

1. Track mood daily for 7-14 days
2. Complete habits regularly during that period
3. Let the system accumulate enough data points for meaningful analysis

Once you have real data, the percentages will reflect your actual habit impacts based on the calculation method described above.
