import { format } from 'date-fns';
import type { Habit, Completion } from '@/types/habit';

export interface ExportData {
  habits?: Habit[];
  completions?: Completion[];
  moodEntries?: any[];
  analytics?: any;
}

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const convertToCSV = (data: any[], headers: string[]): string => {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  };
  
  return csvRows.join('\n');
};

export const exportHabitsComplete = (habits: Habit[], completions: Completion[]): string => {
  const data: any[] = [];
  
  // Add habit information
  habits.forEach(habit => {
    const habitCompletions = completions.filter(c => c.habitId === habit.id);
    
    data.push({
      type: 'Habit',
      id: habit.id,
      name: habit.name,
      description: habit.description || '',
      category: habit.category,
      frequency: habit.frequency,
      currentStreak: habit.currentStreak || 0,
      longestStreak: habit.longestStreak || 0,
      totalCompletions: habitCompletions.length,
      active: habit.active,
      createdAt: format(new Date(habit.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  });
  
  // Add completion records
  completions.forEach(completion => {
    const habit = habits.find(h => h.id === completion.habitId);
    data.push({
      type: 'Completion',
      id: completion.id,
      habitId: completion.habitId,
      habitName: habit?.name || 'Unknown',
      completedAt: format(new Date(completion.completedAt), 'yyyy-MM-dd HH:mm:ss'),
      deviceTimezone: completion.deviceTimezone,
      xpEarned: completion.xpEarned,
      edited: completion.editedFlag,
      createdAt: format(new Date(completion.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  });
  
  const headers = ['type', 'id', 'name', 'description', 'category', 'frequency', 'currentStreak', 'longestStreak', 'totalCompletions', 'active', 'habitId', 'habitName', 'completedAt', 'deviceTimezone', 'xpEarned', 'edited', 'createdAt', 'timezone'];
  
  return convertToCSV(data, headers);
};

export const exportCompletionsOnly = (habits: Habit[], completions: Completion[]): string => {
  const data = completions.map(completion => {
    const habit = habits.find(h => h.id === completion.habitId);
    return {
      habitId: completion.habitId,
      habitName: habit?.name || 'Unknown',
      habitCategory: habit?.category || '',
      completedAt: format(new Date(completion.completedAt), 'yyyy-MM-dd HH:mm:ss'),
      completedAtUTC: new Date(completion.completedAt).toISOString(),
      deviceTimezone: completion.deviceTimezone,
      xpEarned: completion.xpEarned,
      wasEdited: completion.editedFlag,
      createdAt: format(new Date(completion.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      createdAtUTC: new Date(completion.createdAt).toISOString()
    };
  });
  
  const headers = ['habitId', 'habitName', 'habitCategory', 'completedAt', 'completedAtUTC', 'deviceTimezone', 'xpEarned', 'wasEdited', 'createdAt', 'createdAtUTC'];
  
  return convertToCSV(data, headers);
};

export const exportAnalyticsSummary = (analytics: any): string => {
  const data = [{
    totalHabits: analytics.totalHabits || 0,
    totalCompletions: analytics.totalCompletions || 0,
    todayCompletions: analytics.todayCompletions || 0,
    consistencyRate: analytics.consistencyRate || 0,
    uniqueDaysWithCompletions: analytics.uniqueDaysWithCompletions || 0,
    longestStreak: analytics.longestStreak || 0,
    currentStreaks: analytics.currentStreaks || 0,
    completionRate: analytics.completionRate || 0,
    exportedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    exportedAtUTC: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }];
  
  const headers = ['totalHabits', 'totalCompletions', 'todayCompletions', 'consistencyRate', 'uniqueDaysWithCompletions', 'longestStreak', 'currentStreaks', 'completionRate', 'exportedAt', 'exportedAtUTC', 'timezone'];
  
  return convertToCSV(data, headers);
};

export const exportWellbeingData = (moodEntries: any[]): string => {
  const data = moodEntries.map(entry => ({
    id: entry.id || entry._id,
    mood: entry.mood,
    energy: entry.energy || '',
    stress: entry.stress || '',
    notes: entry.notes || '',
    recordedAt: format(new Date(entry.recordedAt || entry.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    recordedAtUTC: new Date(entry.recordedAt || entry.createdAt).toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }));
  
  const headers = ['id', 'mood', 'energy', 'stress', 'notes', 'recordedAt', 'recordedAtUTC', 'timezone'];
  
  return convertToCSV(data, headers);
};
