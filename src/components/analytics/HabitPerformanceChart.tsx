import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { useHabits } from '@/hooks/useHabits';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/utils/cn';

interface HabitPerformance {
  habitId: string;
  habitName: string;
  category: string;
  color: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  consistencyScore: number;
  weeklyPattern: number[];
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface HabitPerformanceChartProps {
  className?: string;
}

export const HabitPerformanceChart: React.FC<HabitPerformanceChartProps> = ({ className }) => {
  const { habits } = useHabits();
  const { habitPerformance, fetchHabitPerformance } = useAnalytics();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [sortBy, setSortBy] = useState<'completion' | 'streak' | 'consistency'>('completion');

  useEffect(() => {
    fetchHabitPerformance(timeRange);
  }, [timeRange, fetchHabitPerformance]);

  // Use real habit data or fallback to mock data
  const habitPerformances: HabitPerformance[] = habitPerformance?.habits || habits.map(habit => ({
    habitId: habit.id || '',
    habitName: habit.name || 'Unnamed Habit',
    category: habit.category || 'Other',
    color: habit.color || '#6B7280',
    completionRate: habit.consistencyRate || 0,
    currentStreak: habit.currentStreak || 0,
    longestStreak: habit.longestStreak || 0,
    totalCompletions: habit.totalCompletions || 0,
    consistencyScore: habit.consistencyRate || 0,
    weeklyPattern: [1, 1, 0, 1, 1, 1, 0], // This would come from real data
    trend: (habit.currentStreak || 0) > 5 ? 'up' : (habit.currentStreak || 0) < 2 ? 'down' : 'stable',
    trendPercentage: Math.min((habit.currentStreak || 0) * 5, 25)
  })) || [
    {
      habitId: '1',
      habitName: 'Morning Exercise',
      category: 'Fitness',
      color: '#3B82F6',
      completionRate: 87,
      currentStreak: 12,
      longestStreak: 18,
      totalCompletions: 26,
      consistencyScore: 92,
      weeklyPattern: [1, 1, 0, 1, 1, 1, 0],
      trend: 'up',
      trendPercentage: 15
    },
    {
      habitId: '2',
      habitName: 'Read 30 Minutes',
      category: 'Learning',
      color: '#10B981',
      completionRate: 73,
      currentStreak: 5,
      longestStreak: 14,
      totalCompletions: 22,
      consistencyScore: 78,
      weeklyPattern: [1, 0, 1, 1, 1, 0, 1],
      trend: 'stable',
      trendPercentage: 2
    },
    {
      habitId: '3',
      habitName: 'Meditation',
      category: 'Wellness',
      color: '#8B5CF6',
      completionRate: 93,
      currentStreak: 21,
      longestStreak: 21,
      totalCompletions: 28,
      consistencyScore: 96,
      weeklyPattern: [1, 1, 1, 1, 1, 1, 1],
      trend: 'up',
      trendPercentage: 8
    },
    {
      habitId: '4',
      habitName: 'Drink 8 Glasses Water',
      category: 'Health',
      color: '#06B6D4',
      completionRate: 67,
      currentStreak: 3,
      longestStreak: 9,
      totalCompletions: 20,
      consistencyScore: 71,
      weeklyPattern: [0, 1, 1, 0, 1, 1, 0],
      trend: 'down',
      trendPercentage: -12
    },
    {
      habitId: '5',
      habitName: 'Journal Writing',
      category: 'Personal',
      color: '#F59E0B',
      completionRate: 80,
      currentStreak: 8,
      longestStreak: 15,
      totalCompletions: 24,
      consistencyScore: 85,
      weeklyPattern: [1, 1, 0, 1, 1, 1, 1],
      trend: 'up',
      trendPercentage: 5
    }
  ];

  const sortedHabits = [...habitPerformances].sort((a, b) => {
    switch (sortBy) {
      case 'completion':
        return (b.completionRate || 0) - (a.completionRate || 0);
      case 'streak':
        return (b.currentStreak || 0) - (a.currentStreak || 0);
      case 'consistency':
        return (b.consistencyScore || 0) - (a.consistencyScore || 0);
      default:
        return 0;
    }
  });

  const getRankBadge = (index: number) => {
    const colors = [
      'bg-yellow-500 text-white', // 1st place - gold
      'bg-gray-400 text-white',   // 2nd place - silver
      'bg-amber-600 text-white',  // 3rd place - bronze
      'bg-blue-500 text-white',   // 4th place
      'bg-purple-500 text-white'  // 5th place
    ];
    
    return colors[index] || 'bg-gray-500 text-white';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const renderWeeklyPattern = (weeklyData: number[], color: string) => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    return (
      <div className="flex gap-1">
        {weeklyData.map((completed, index) => (
          <div
            key={index}
            className={cn(
              'w-6 h-6 rounded text-xs flex items-center justify-center font-medium',
              completed ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            )}
            style={{ backgroundColor: completed ? color : undefined }}
          >
            {days[index]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Habit Performance Analysis
        </h3>
        <Badge variant="outline" size="sm">
          {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
        </Badge>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {habitPerformances.length > 0 
              ? Math.round(habitPerformances.reduce((acc, h) => acc + (h.completionRate || 0), 0) / habitPerformances.length)
              : 0}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Average Completion
          </div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {habitPerformances.length > 0 
              ? Math.max(...habitPerformances.map(h => h.currentStreak || 0))
              : 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Longest Active Streak
          </div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {habitPerformances.reduce((acc, h) => acc + (h.totalCompletions || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Completions
          </div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {habitPerformances.length > 0 
              ? Math.round(habitPerformances.reduce((acc, h) => acc + (h.consistencyScore || 0), 0) / habitPerformances.length)
              : 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Consistency Score
          </div>
        </Card>
      </div>

      {/* Detailed Habit Performance */}
      <div className="space-y-4">
        {sortedHabits.map((habit, index) => (
          <Card key={habit.habitId} className="p-6">
            <div className="flex items-start gap-4">
              {/* Rank Badge */}
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                getRankBadge(index)
              )}>
                {index + 1}
              </div>

              {/* Habit Icon */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0"
                style={{ backgroundColor: habit.color }}
              >
                <Target className="h-6 w-6" />
              </div>

              {/* Habit Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {habit.habitName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {habit.category}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {habit.trend !== 'stable' && (
                      <div className={cn('flex items-center gap-1', getTrendColor(habit.trend))}>
                        {React.createElement(getTrendIcon(habit.trend)!, { className: 'h-4 w-4' })}
                        <span className="text-sm font-medium">
                          {(habit.trendPercentage || 0) > 0 ? '+' : ''}{habit.trendPercentage || 0}%
                        </span>
                      </div>
                    )}
                    <Badge variant="outline" size="sm">
                      {habit.completionRate || 0}% complete
                    </Badge>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {habit.currentStreak || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Current Streak
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {habit.longestStreak || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Best Streak
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {habit.totalCompletions || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total Done
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {habit.consistencyScore || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Consistency
                    </div>
                  </div>
                </div>

                {/* Weekly Pattern */}
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    This Week's Pattern
                  </div>
                  {renderWeeklyPattern(habit.weeklyPattern, habit.color)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-1">
          {(['completion', 'streak', 'consistency'] as const).map((sort) => (
            <Button
              key={sort}
              variant={sortBy === sort ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy(sort)}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};