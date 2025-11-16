import React from 'react';
import { Calendar, TrendingUp, Target, Award, Flame } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { ProgressRing } from './ProgressRing';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { type Completion } from '@/types/habit';
import { cn } from '@/utils/cn';

interface WeeklySummaryProps {
  completions: Completion[];
  totalHabits: number;
  week?: Date;
  showInsights?: boolean;
  className?: string;
}

interface DayProgress {
  date: Date;
  completed: number;
  total: number;
  percentage: number;
  isToday: boolean;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  completions = [],
  totalHabits = 0,
  week = new Date(),
  showInsights = true,
  className,
}) => {
  // Add error boundary for safety
  if (!Array.isArray(completions)) {
    console.warn('WeeklySummary: completions is not an array:', completions);
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          Unable to load weekly summary data
        </div>
      </Card>
    );
  }
  const weekStart = startOfWeek(week, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Calculate daily progress
  const dailyProgress: DayProgress[] = weekDays.map(date => {
    const dayCompletions = completions.filter(completion => {
      try {
        const completionDate = new Date(completion.completedAt);
        if (isNaN(completionDate.getTime())) {
          console.warn('Invalid completion date:', completion.completedAt);
          return false;
        }
        return format(completionDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      } catch (error) {
        console.warn('Error processing completion date:', completion.completedAt, error);
        return false;
      }
    });

    return {
      date,
      completed: dayCompletions.length,
      total: totalHabits,
      percentage: totalHabits > 0 ? Math.round((dayCompletions.length / totalHabits) * 100) : 0,
      isToday: isToday(date),
    };
  });

  // Calculate week statistics
  const totalCompletions = dailyProgress.reduce((sum, day) => sum + day.completed, 0);
  const totalPossible = totalHabits * 7;
  const weeklyPercentage = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;
  const perfectDays = dailyProgress.filter(day => day.percentage === 100).length;
  const activeDays = dailyProgress.filter(day => day.completed > 0).length;

  // Generate insights
  const generateInsights = () => {
    const insights = [];

    if (weeklyPercentage >= 90) {
      insights.push({
        type: 'success',
        icon: '🏆',
        message: 'Outstanding week! You\'re crushing your habits!',
      });
    } else if (weeklyPercentage >= 70) {
      insights.push({
        type: 'good',
        icon: '👏',
        message: 'Great consistency this week! Keep it up!',
      });
    } else if (weeklyPercentage >= 50) {
      insights.push({
        type: 'moderate',
        icon: '💪',
        message: 'Good progress! A few more completions and you\'ll hit your stride.',
      });
    } else {
      insights.push({
        type: 'encourage',
        icon: '🌱',
        message: 'Every journey starts with small steps. You\'ve got this!',
      });
    }

    if (perfectDays > 0) {
      insights.push({
        type: 'achievement',
        icon: '⭐',
        message: `${perfectDays} perfect ${perfectDays === 1 ? 'day' : 'days'} this week!`,
      });
    }

    const bestDay = dailyProgress.reduce((best, day) => 
      day.percentage > best.percentage ? day : best
    );

    if (bestDay.percentage > 0) {
      insights.push({
        type: 'info',
        icon: '📅',
        message: `Best day: ${format(bestDay.date, 'EEEE')} (${bestDay.percentage}%)`,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#10B981'; // Green
    if (percentage >= 70) return '#3B82F6'; // Blue
    if (percentage >= 50) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <Card className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Summary
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <Badge 
          variant={weeklyPercentage >= 80 ? 'primary' : weeklyPercentage >= 60 ? 'secondary' : 'outline'}
          className="font-semibold"
        >
          {weeklyPercentage}% Complete
        </Badge>
      </div>

      {/* Weekly Progress Ring */}
      <div className="flex items-center justify-center">
        <ProgressRing
          progress={weeklyPercentage}
          size="xl"
          color={getProgressColor(weeklyPercentage)}
          animated={true}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {weeklyPercentage}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {totalCompletions}/{totalPossible}
            </div>
          </div>
        </ProgressRing>
      </div>

      {/* Daily Progress Bar */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Daily Progress
        </h4>
        <div className="grid grid-cols-7 gap-2">
          {dailyProgress.map((day, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {format(day.date, 'EEE')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {format(day.date, 'd')}
              </div>
              <div
                className={cn(
                  'w-full h-16 rounded-lg border-2 flex items-end justify-center p-1 transition-all duration-200',
                  day.isToday 
                    ? 'border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                )}
              >
                <div
                  className="w-full rounded transition-all duration-500"
                  style={{
                    height: `${day.percentage}%`,
                    backgroundColor: getProgressColor(day.percentage),
                    minHeight: day.completed > 0 ? '8px' : '0px',
                  }}
                />
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                {day.completed}/{day.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Perfect Days
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {perfectDays}
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Active Days
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {activeDays}
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Award className="h-4 w-4 text-success-600 dark:text-success-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Completions
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {totalCompletions}
          </div>
        </div>
      </div>

      {/* Insights */}
      {showInsights && insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Weekly Insights
          </h4>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="text-lg">{insight.icon}</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};