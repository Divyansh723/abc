import MoodEntry from '../models/MoodEntry.js';
import Habit from '../models/Habit.js';
import Completion from '../models/Completion.js';
import mongoose from 'mongoose';

// Create mood entry
export const createMoodEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mood, energy, stress, notes, date, timezone } = req.body;

    // Validate mood values
    if (mood < 1 || mood > 5 || energy < 1 || energy > 5 || stress < 1 || stress > 5) {
      return res.status(400).json({
        success: false,
        message: 'Mood, energy, and stress values must be between 1 and 5'
      });
    }

    const moodEntry = new MoodEntry({
      userId,
      mood,
      energy,
      stress,
      notes,
      date: date ? new Date(date) : new Date(),
      timezone: timezone || 'UTC'
    });

    await moodEntry.save();

    res.status(201).json({
      success: true,
      data: { moodEntry }
    });
  } catch (error) {
    console.error('Error creating mood entry:', error);
    
    // Handle duplicate entry error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Mood entry already exists for this date'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create mood entry'
    });
  }
};

// Get mood entries
export const getMoodEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30, page = 1, limit = 50 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moodEntries = await MoodEntry.find({
      userId,
      date: { $gte: startDate }
    })
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await MoodEntry.countDocuments({
      userId,
      date: { $gte: startDate }
    });

    res.json({
      success: true,
      data: {
        moodEntries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood entries'
    });
  }
};

// Get wellbeing score
export const getWellbeingScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get mood entries for the period
    const moodEntries = await MoodEntry.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    if (moodEntries.length === 0) {
      return res.json({
        success: true,
        data: {
          overall: 0,
          mood: 0,
          energy: 0,
          stress: 0,
          weeklyChange: 0,
          habitCorrelation: 0,
          entriesCount: 0
        }
      });
    }

    // Calculate averages
    const avgMood = moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length;
    const avgEnergy = moodEntries.reduce((sum, entry) => sum + entry.energy, 0) / moodEntries.length;
    const avgStress = moodEntries.reduce((sum, entry) => sum + entry.stress, 0) / moodEntries.length;

    // Calculate overall score (mood + energy - stress, normalized to 0-100)
    const overall = Math.round(((avgMood + avgEnergy + (6 - avgStress)) / 15) * 100);

    // Calculate weekly change (compare last 7 days to previous 7 days)
    const lastWeekEntries = moodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    });

    const previousWeekEntries = moodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= twoWeeksAgo && entryDate < weekAgo;
    });

    let weeklyChange = 0;
    if (lastWeekEntries.length > 0 && previousWeekEntries.length > 0) {
      const lastWeekAvg = lastWeekEntries.reduce((sum, entry) => sum + entry.mood + entry.energy + (6 - entry.stress), 0) / (lastWeekEntries.length * 3);
      const prevWeekAvg = previousWeekEntries.reduce((sum, entry) => sum + entry.mood + entry.energy + (6 - entry.stress), 0) / (previousWeekEntries.length * 3);
      weeklyChange = Math.round(((lastWeekAvg - prevWeekAvg) / prevWeekAvg) * 100);
    }

    // Simple habit correlation (would be more complex in real implementation)
    const habitCorrelation = Math.min(0.8, moodEntries.length / parseInt(days));

    res.json({
      success: true,
      data: {
        overall,
        mood: Math.round(avgMood * 10) / 10,
        energy: Math.round(avgEnergy * 10) / 10,
        stress: Math.round(avgStress * 10) / 10,
        weeklyChange,
        habitCorrelation: Math.round(habitCorrelation * 100) / 100,
        entriesCount: moodEntries.length
      }
    });
  } catch (error) {
    console.error('Error calculating wellbeing score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate wellbeing score'
    });
  }
};

// Get habit impact analysis
export const getHabitImpactAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get user's habits
    const habits = await Habit.find({ userId, active: true });

    // Get completions and mood entries for the period
    const completions = await Completion.find({
      userId,
      completedAt: { $gte: startDate }
    });

    const moodEntries = await MoodEntry.find({
      userId,
      date: { $gte: startDate }
    });

    const habitImpacts = [];

    for (const habit of habits) {
      const habitCompletions = completions.filter(c => c.habitId.toString() === habit._id.toString());
      
      // Skip habits with no completions
      if (habitCompletions.length === 0) continue;

      // Simple correlation analysis
      const completionDates = habitCompletions.map(c => c.completedAt.toDateString());
      const moodOnCompletionDays = moodEntries.filter(m => completionDates.includes(m.date.toDateString()));
      const moodOnNonCompletionDays = moodEntries.filter(m => !completionDates.includes(m.date.toDateString()));

      let moodImpact = 0;
      let energyImpact = 0;
      let stressImpact = 0;
      let hasEnoughData = false;
      let dataStatus = 'insufficient';

      // Require at least 3 days of data on completion days AND 3 days on non-completion days
      const minDataPoints = 3;
      
      if (moodOnCompletionDays.length >= minDataPoints && moodOnNonCompletionDays.length >= minDataPoints) {
        hasEnoughData = true;
        dataStatus = 'sufficient';
        
        const avgMoodWithHabit = moodOnCompletionDays.reduce((sum, m) => sum + m.mood, 0) / moodOnCompletionDays.length;
        const avgMoodWithoutHabit = moodOnNonCompletionDays.reduce((sum, m) => sum + m.mood, 0) / moodOnNonCompletionDays.length;
        
        // Calculate impact as percentage of scale range (1-5 = 4 point range)
        // This gives more meaningful percentages for small scales
        const scaleRange = 4; // 5 - 1 = 4
        
        // Clamp values between -100 and +100
        moodImpact = Math.max(-100, Math.min(100, Math.round(((avgMoodWithHabit - avgMoodWithoutHabit) / scaleRange) * 100)));

        const avgEnergyWithHabit = moodOnCompletionDays.reduce((sum, m) => sum + m.energy, 0) / moodOnCompletionDays.length;
        const avgEnergyWithoutHabit = moodOnNonCompletionDays.reduce((sum, m) => sum + m.energy, 0) / moodOnNonCompletionDays.length;
        
        energyImpact = Math.max(-100, Math.min(100, Math.round(((avgEnergyWithHabit - avgEnergyWithoutHabit) / scaleRange) * 100)));

        const avgStressWithHabit = moodOnCompletionDays.reduce((sum, m) => sum + m.stress, 0) / moodOnCompletionDays.length;
        const avgStressWithoutHabit = moodOnNonCompletionDays.reduce((sum, m) => sum + m.stress, 0) / moodOnNonCompletionDays.length;
        
        stressImpact = Math.max(-100, Math.min(100, Math.round(((avgStressWithHabit - avgStressWithoutHabit) / scaleRange) * 100)));
      }

      // Generate insights based on whether we have enough data
      const insights = [];
      if (hasEnoughData) {
        if (moodImpact > 10) insights.push('Significantly improves mood');
        else if (moodImpact < -10) insights.push('May negatively impact mood');
        
        if (energyImpact > 10) insights.push('Boosts energy levels');
        else if (energyImpact < -10) insights.push('May reduce energy');
        
        if (stressImpact < -10) insights.push('Helps reduce stress');
        else if (stressImpact > 10) insights.push('May increase stress');
      } else {
        insights.push('Need at least 4-7 days of mood tracking data for accurate analysis');
        insights.push(`Currently: ${moodOnCompletionDays.length} days with habit, ${moodOnNonCompletionDays.length} days without`);
      }

      habitImpacts.push({
        habitId: habit._id,
        habitName: habit.name,
        category: habit.category,
        color: habit.color,
        moodImpact,
        energyImpact,
        stressImpact,
        correlation: hasEnoughData 
          ? (Math.abs(moodImpact) > 10 ? 'strong' : Math.abs(moodImpact) > 5 ? 'moderate' : 'weak')
          : 'insufficient_data',
        sampleSize: habitCompletions.length,
        completionRate: Math.round((habitCompletions.length / parseInt(days)) * 100),
        hasEnoughData,
        dataStatus,
        daysWithHabit: moodOnCompletionDays.length,
        daysWithoutHabit: moodOnNonCompletionDays.length,
        insights
      });
    }

    res.json({
      success: true,
      data: habitImpacts
    });
  } catch (error) {
    console.error('Error analyzing habit impact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze habit impact'
    });
  }
};

// Get wellbeing insights
export const getWellbeingInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // This would contain more sophisticated analysis in a real implementation
    const insights = {
      patterns: [
        {
          type: 'positive',
          title: 'Morning Routine Boost',
          description: 'Your mood is higher on days when you complete morning habits.',
          confidence: 0.78
        },
        {
          type: 'insight',
          title: 'Stress Reduction',
          description: 'Meditation and exercise correlate with lower stress levels.',
          confidence: 0.85
        },
        {
          type: 'warning',
          title: 'Weekend Dip',
          description: 'Your consistency drops on weekends, affecting your mood.',
          confidence: 0.65
        }
      ],
      recommendations: [
        'Consider adding a weekend-specific routine to maintain consistency',
        'Your meditation habit shows strong positive impact - try increasing frequency',
        'Morning habits show great results - maintain this timing'
      ],
      weeklyHighlights: {
        bestMoodDay: 'Tuesday',
        highestEnergyDay: 'Monday',
        lowestStressDay: 'Wednesday',
        mostProductiveDay: 'Thursday'
      }
    };

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error generating wellbeing insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate wellbeing insights'
    });
  }
};