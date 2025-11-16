import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isFuture } from 'date-fns';
import { CheckCircle, Circle, X } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { type Completion } from '@/types/habit';
import { cn } from '@/utils/cn';

interface ConsistencyCalendarProps {
  completions: Completion[];
  month?: Date;
  habitName?: string;
  habitColor?: string;
  showLegend?: boolean;
  compact?: boolean;
  className?: string;
}

export const ConsistencyCalendar: React.FC<ConsistencyCalendarProps> = ({
  completions,
  month = new Date(),
  habitName,
  habitColor = '#3B82F6',
  showLegend = true,
  compact = false,
  className,
}) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Debug: Log completions data
  console.log('ConsistencyCalendar - Completions received:', completions);
  console.log('ConsistencyCalendar - Completions count:', completions?.length || 0);

  // Get completion dates as a Set for fast lookup
  const completionDates = new Set(
    (completions || [])
      .filter(completion => completion && completion.completedAt)
      .map(completion => {
        try {
          const date = new Date(completion.completedAt);
          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.warn('Invalid completion date:', completion.completedAt);
            return null;
          }
          const formatted = format(date, 'yyyy-MM-dd');
          console.log('Formatted completion date:', formatted);
          return formatted;
        } catch (error) {
          console.warn('Error formatting completion date:', error);
          return null;
        }
      })
      .filter((date): date is string => date !== null)
  );

  console.log('ConsistencyCalendar - Completion dates:', Array.from(completionDates));

  const getDayStatus = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const today = new Date();
    
    if (isFuture(day)) return 'future';
    if (completionDates.has(dayString)) return 'completed';
    if (isSameDay(day, today)) return 'today';
    return 'missed';
  };

  const getDayIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-white" />;
      case 'today':
        return <Circle className="h-4 w-4 text-gray-400" />;
      case 'missed':
        return <X className="h-3 w-3 text-gray-400" />;
      default:
        return null;
    }
  };

  const getDayClasses = (_day: Date, status: string) => {
    const baseClasses = cn(
      'flex items-center justify-center rounded-lg transition-all duration-200 border',
      compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
    );

    switch (status) {
      case 'completed':
        return cn(
          baseClasses,
          'border-transparent text-white shadow-sm',
          'hover:scale-105 cursor-pointer'
        );
      case 'today':
        return cn(
          baseClasses,
          'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20',
          'text-primary-700 dark:text-primary-300 font-medium'
        );
      case 'missed':
        return cn(
          baseClasses,
          'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
          'text-gray-400 dark:text-gray-500'
        );
      case 'future':
        return cn(
          baseClasses,
          'border-gray-100 dark:border-gray-800 bg-gray-25 dark:bg-gray-900',
          'text-gray-300 dark:text-gray-600'
        );
      default:
        return baseClasses;
    }
  };

  // Calculate statistics
  const totalDays = days.filter(day => !isFuture(day)).length;
  const completedDays = days.filter(day => getDayStatus(day) === 'completed').length;
  const consistencyRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // Get weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {habitName ? `${habitName} - ` : ''}
            {format(month, 'MMMM yyyy')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {completedDays} of {totalDays} days completed
          </p>
        </div>
        <Badge 
          variant={consistencyRate >= 80 ? 'primary' : consistencyRate >= 60 ? 'secondary' : 'outline'}
          className="font-semibold"
        >
          {consistencyRate}% consistent
        </Badge>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Weekday headers */}
        <div className={cn(
          'grid grid-cols-7 gap-1',
          compact ? 'mb-1' : 'mb-2'
        )}>
          {weekdays.map(day => (
            <div 
              key={day} 
              className={cn(
                'text-center font-medium text-gray-500 dark:text-gray-400',
                compact ? 'text-xs py-1' : 'text-sm py-2'
              )}
            >
              {compact ? day.charAt(0) : day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: monthStart.getDay() }, (_, i) => (
            <div key={`empty-${i}`} className={compact ? 'w-8 h-8' : 'w-10 h-10'} />
          ))}
          
          {/* Month days */}
          {days.map(day => {
            const status = getDayStatus(day);
            const dayNumber = format(day, 'd');
            
            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={getDayClasses(day, status)}
                style={status === 'completed' ? { backgroundColor: habitColor } : {}}
                title={`${format(day, 'MMM d, yyyy')} - ${status}`}
              >
                {status === 'completed' || status === 'today' || status === 'missed' ? (
                  getDayIcon(status)
                ) : (
                  <span className="font-medium">{dayNumber}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded flex items-center justify-center"
              style={{ backgroundColor: habitColor }}
            >
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              <X className="h-2 w-2 text-gray-400" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Missed</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Circle className="h-3 w-3 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      )}
    </Card>
  );
};