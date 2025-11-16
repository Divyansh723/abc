import { Habit, Completion } from '../models/index.js';
import XPTransaction from '../models/XPTransaction.js';
import mongoose from 'mongoose';

// Get user analytics overview
export const getAnalyticsOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get user's habits
    const habits = await Habit.find({ userId, active: true });
    
    // Get completions for the period
    const completions = await Completion.find({
      userId,
      completedAt: { $gte: startDate }
    }).sort({ completedAt: -1 });

    // Calculate stats
    const totalHabits = habits.length;
    const totalCompletions = completions.length;
    const uniqueDaysWithCompletions = new Set(
      completions.map(c => c.completedAt.toDateString())
    ).size;
    
    const consistencyRate = totalHabits > 0 && parseInt(days) > 0 
      ? Math.round((totalCompletions / (totalHabits * parseInt(days))) * 100)
      : 0;

    // Get today's completions
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayCompletions = await Completion.countDocuments({
      userId,
      completedAt: { $gte: startOfDay, $lt: endOfDay }
    });

    // Calculate streaks
    const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);
    const currentStreaks = habits.reduce((sum, h) => sum + h.currentStreak, 0);

    res.json({
      success: true,
      data: {
        totalHabits,
        totalCompletions,
        todayCompletions,
        consistencyRate,
        uniqueDaysWithCompletions,
        longestStreak,
        currentStreaks,
        completionRate: totalHabits > 0 ? Math.round((todayCompletions / totalHabits) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics overview'
    });
  }
};

// Get trend data
export const getTrendData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get daily completion counts
    const dailyCompletions = await Completion.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          count: { $sum: 1 },
          xpEarned: { $sum: '$xpEarned' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing days with 0 completions
    const trendData = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayData = dailyCompletions.find(d => d._id === dateString);
      trendData.push({
        date: dateString,
        completions: dayData ? dayData.count : 0,
        xpEarned: dayData ? dayData.xpEarned : 0
      });
    }

    res.json({
      success: true,
      data: trendData
    });
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trend data'
    });
  }
};

// Get weekly summary
export const getWeeklySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get last 7 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Get user's active habits count
    const totalHabits = await Habit.countDocuments({ userId, active: true });

    // Get completions for the week
    const completions = await Completion.find({
      userId,
      completedAt: { $gte: startDate }
    }).populate('habitId', 'name category');

    // Transform completions to match frontend expectations
    const transformedCompletions = completions.map(completion => ({
      id: completion._id.toString(),
      habitId: completion.habitId._id.toString(),
      userId: completion.userId.toString(),
      completedAt: completion.completedAt,
      deviceTimezone: completion.deviceTimezone || 'UTC',
      xpEarned: completion.xpEarned || 10,
      editedFlag: completion.editedFlag || false,
      createdAt: completion.createdAt
    }));

    // Calculate weekly stats
    const totalCompletions = completions.length;
    const averageCompletionRate = totalHabits > 0 ? Math.round((totalCompletions / (totalHabits * 7)) * 100) : 0;
    
    // Find best and worst days
    const dailyStats = {};
    completions.forEach(completion => {
      const day = completion.completedAt.toDateString();
      dailyStats[day] = (dailyStats[day] || 0) + 1;
    });
    
    const days = Object.keys(dailyStats);
    const bestDay = days.reduce((best, day) => 
      dailyStats[day] > (dailyStats[best] || 0) ? day : best, 'Monday'
    );
    const worstDay = days.reduce((worst, day) => 
      dailyStats[day] < (dailyStats[worst] || Infinity) ? day : worst, 'Sunday'
    );

    res.json({
      success: true,
      data: {
        completions: transformedCompletions,
        totalHabits,
        weeklyStats: {
          totalCompletions,
          averageCompletionRate,
          bestDay: new Date(bestDay).toLocaleDateString('en-US', { weekday: 'long' }),
          worstDay: new Date(worstDay).toLocaleDateString('en-US', { weekday: 'long' })
        }
      }
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly summary'
    });
  }
};

// Get habit performance data
export const getHabitPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Get user's habits with their completions
    const habits = await Habit.find({ userId, active: true });
    const completions = await Completion.find({
      userId,
      completedAt: { $gte: startDate }
    });

    const habitPerformance = habits.map(habit => {
      const habitCompletions = completions.filter(c => 
        c.habitId.toString() === habit._id.toString()
      );

      const totalPossibleDays = parseInt(timeRange);
      const completionRate = Math.round((habitCompletions.length / totalPossibleDays) * 100);
      const totalXP = habitCompletions.reduce((sum, c) => sum + c.xpEarned, 0);

      return {
        habitId: habit._id,
        name: habit.name,
        category: habit.category,
        color: habit.color,
        icon: habit.icon,
        completions: habitCompletions.length,
        completionRate,
        totalXP,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        consistencyRate: habit.consistencyRate
      };
    });

    // Sort by completion rate
    habitPerformance.sort((a, b) => b.completionRate - a.completionRate);

    res.json({
      success: true,
      data: habitPerformance
    });
  } catch (error) {
    console.error('Error fetching habit performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch habit performance'
    });
  }
};

// Get consistency data for calendar view
export const getConsistencyData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;
    
    // Parse month parameter (format: YYYY-MM)
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // Last day of month

    const completions = await Completion.find({
      userId,
      completedAt: { $gte: startDate, $lte: endDate }
    });

    // Group completions by date
    const consistencyData = {};
    completions.forEach(completion => {
      const dateKey = completion.completedAt.toISOString().split('T')[0];
      if (!consistencyData[dateKey]) {
        consistencyData[dateKey] = {
          date: dateKey,
          count: 0,
          habits: []
        };
      }
      consistencyData[dateKey].count++;
      consistencyData[dateKey].habits.push(completion.habitId);
    });

    // Convert to array format expected by frontend
    const result = Object.values(consistencyData).map(day => ({
      date: day.date,
      value: day.count,
      level: day.count >= 5 ? 4 : day.count >= 3 ? 3 : day.count >= 2 ? 2 : day.count >= 1 ? 1 : 0
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching consistency data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consistency data'
    });
  }
};


// Export user data
export const exportData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exportType, dateRange } = req.query;
    
    // Calculate date range
    let startDate = null;
    if (dateRange && dateRange !== 'all_time') {
      startDate = new Date();
      switch (dateRange) {
        case '7_days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30_days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90_days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1_year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
    }

    let csvData = '';
    let filename = '';
    const timestamp = new Date().toISOString().split('T')[0];

    switch (exportType) {
      case 'habits_complete': {
        // Get all habits and completions
        const habits = await Habit.find({ userId }).lean();
        const completionsQuery = startDate 
          ? { userId, completedAt: { $gte: startDate } }
          : { userId };
        const completions = await Completion.find(completionsQuery).lean();

        // Build CSV
        csvData = 'Type,ID,Name,Description,Category,Frequency,CurrentStreak,LongestStreak,TotalCompletions,Active,HabitID,HabitName,CompletedAt,CompletedAtUTC,DeviceTimezone,XPEarned,Edited,CreatedAt,CreatedAtUTC,Timezone\n';
        
        // Add habits
        habits.forEach(habit => {
          const habitCompletions = completions.filter(c => c.habitId.toString() === habit._id.toString());
          csvData += `Habit,"${habit._id}","${habit.name}","${habit.description || ''}","${habit.category}","${habit.frequency}",${habit.currentStreak || 0},${habit.longestStreak || 0},${habitCompletions.length},${habit.active},,,,,,,,${new Date(habit.createdAt).toISOString()},"${Intl.DateTimeFormat().resolvedOptions().timeZone}"\n`;
        });
        
        // Add completions
        completions.forEach(completion => {
          const habit = habits.find(h => h._id.toString() === completion.habitId.toString());
          csvData += `Completion,"${completion._id}",,,,,,,,"${completion.habitId}","${habit?.name || 'Unknown'}","${new Date(completion.completedAt).toLocaleString()}","${new Date(completion.completedAt).toISOString()}","${completion.deviceTimezone}",${completion.xpEarned},${completion.editedFlag},"${new Date(completion.createdAt).toLocaleString()}","${new Date(completion.createdAt).toISOString()}","${Intl.DateTimeFormat().resolvedOptions().timeZone}"\n`;
        });
        
        filename = `habitforge-complete-export-${timestamp}.csv`;
        break;
      }

      case 'completions_only': {
        const habits = await Habit.find({ userId }).lean();
        const completionsQuery = startDate 
          ? { userId, completedAt: { $gte: startDate } }
          : { userId };
        const completions = await Completion.find(completionsQuery).lean();

        csvData = 'HabitID,HabitName,HabitCategory,CompletedAt,CompletedAtUTC,DeviceTimezone,XPEarned,WasEdited,CreatedAt,CreatedAtUTC\n';
        
        completions.forEach(completion => {
          const habit = habits.find(h => h._id.toString() === completion.habitId.toString());
          csvData += `"${completion.habitId}","${habit?.name || 'Unknown'}","${habit?.category || ''}","${new Date(completion.completedAt).toLocaleString()}","${new Date(completion.completedAt).toISOString()}","${completion.deviceTimezone}",${completion.xpEarned},${completion.editedFlag},"${new Date(completion.createdAt).toLocaleString()}","${new Date(completion.createdAt).toISOString()}"\n`;
        });
        
        filename = `habitforge-completions-${timestamp}.csv`;
        break;
      }

      case 'analytics_summary': {
        const habits = await Habit.find({ userId, active: true }).lean();
        const completionsQuery = startDate 
          ? { userId, completedAt: { $gte: startDate } }
          : { userId };
        const completions = await Completion.find(completionsQuery).lean();

        // Basic stats
        const totalHabits = habits.length;
        const totalCompletions = completions.length;
        const uniqueDays = new Set(completions.map(c => new Date(c.completedAt).toDateString())).size;
        const longestStreak = Math.max(...habits.map(h => h.longestStreak || 0), 0);
        const currentStreaks = habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0);
        const totalXP = completions.reduce((sum, c) => sum + (c.xpEarned || 0), 0);

        // Calculate daily trends
        const dailyCompletions = {};
        completions.forEach(c => {
          const date = new Date(c.completedAt).toISOString().split('T')[0];
          dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
        });

        // Calculate weekly stats
        const last7Days = completions.filter(c => {
          const completionDate = new Date(c.completedAt);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return completionDate >= sevenDaysAgo;
        });

        const weeklyCompletions = last7Days.length;
        const weeklyXP = last7Days.reduce((sum, c) => sum + (c.xpEarned || 0), 0);
        const weeklyAvgPerDay = (weeklyCompletions / 7).toFixed(2);

        // Calculate completion rate
        const daysInRange = startDate 
          ? Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24))
          : uniqueDays;
        const completionRate = totalHabits > 0 && daysInRange > 0
          ? ((totalCompletions / (totalHabits * daysInRange)) * 100).toFixed(2)
          : 0;

        // Per-habit breakdown
        const habitStats = habits.map(h => {
          const habitCompletions = completions.filter(c => c.habitId.toString() === h._id.toString());
          return {
            habitName: h.name,
            category: h.category,
            completions: habitCompletions.length,
            currentStreak: h.currentStreak || 0,
            longestStreak: h.longestStreak || 0,
            completionRate: daysInRange > 0 ? ((habitCompletions.length / daysInRange) * 100).toFixed(2) : 0
          };
        });

        // Build comprehensive CSV
        csvData = 'Section,Metric,Value,Details\n';
        csvData += `"Overview","Total Habits",${totalHabits},"Active habits"\n`;
        csvData += `"Overview","Total Completions",${totalCompletions},"All time completions"\n`;
        csvData += `"Overview","Unique Days Active",${uniqueDays},"Days with at least one completion"\n`;
        csvData += `"Overview","Total XP Earned",${totalXP},"Experience points"\n`;
        csvData += `"Overview","Completion Rate",${completionRate}%,"Overall completion percentage"\n`;
        csvData += `"Streaks","Longest Streak",${longestStreak},"Best streak across all habits"\n`;
        csvData += `"Streaks","Current Streaks Total",${currentStreaks},"Sum of all current streaks"\n`;
        csvData += `"Weekly","Last 7 Days Completions",${weeklyCompletions},"Completions in past week"\n`;
        csvData += `"Weekly","Last 7 Days XP",${weeklyXP},"XP earned in past week"\n`;
        csvData += `"Weekly","Daily Average",${weeklyAvgPerDay},"Average completions per day"\n`;
        csvData += `"Export","Exported At","${new Date().toLocaleString()}","Local time"\n`;
        csvData += `"Export","Exported At UTC","${new Date().toISOString()}","UTC time"\n`;
        csvData += `"Export","Timezone","${Intl.DateTimeFormat().resolvedOptions().timeZone}","User timezone"\n`;
        csvData += '\n';
        
        // Add per-habit breakdown
        csvData += 'HabitName,Category,Completions,CurrentStreak,LongestStreak,CompletionRate\n';
        habitStats.forEach(stat => {
          csvData += `"${stat.habitName}","${stat.category}",${stat.completions},${stat.currentStreak},${stat.longestStreak},${stat.completionRate}%\n`;
        });
        csvData += '\n';

        // Add daily trend data
        csvData += 'Date,Completions\n';
        Object.keys(dailyCompletions).sort().forEach(date => {
          csvData += `"${date}",${dailyCompletions[date]}\n`;
        });
        
        filename = `habitforge-analytics-${timestamp}.csv`;
        break;
      }

      case 'wellbeing_data': {
        const MoodEntry = mongoose.model('MoodEntry');
        const moodQuery = startDate 
          ? { userId, createdAt: { $gte: startDate } }
          : { userId };
        const moodEntries = await MoodEntry.find(moodQuery).lean();

        csvData = 'ID,Mood,Energy,Stress,Notes,RecordedAt,RecordedAtUTC,Timezone\n';
        
        moodEntries.forEach(entry => {
          csvData += `"${entry._id}","${entry.mood}","${entry.energy || ''}","${entry.stress || ''}","${(entry.notes || '').replace(/"/g, '""')}","${new Date(entry.createdAt).toLocaleString()}","${new Date(entry.createdAt).toISOString()}","${Intl.DateTimeFormat().resolvedOptions().timeZone}"\n`;
        });
        
        filename = `habitforge-wellbeing-${timestamp}.csv`;
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    res.json({
      success: true,
      data: {
        data: csvData,
        filename
      }
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
};
