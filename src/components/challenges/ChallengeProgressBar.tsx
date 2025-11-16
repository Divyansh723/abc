import React from 'react';
import { cn } from '@/utils/cn';
import { Clock, Target, TrendingUp } from 'lucide-react';

interface ChallengeProgressBarProps {
  current: number;
  target: number;
  percentage: number;
  startDate: string;
  duration: number;
  className?: string;
  showDetails?: boolean;
}

export const ChallengeProgressBar: React.FC<ChallengeProgressBarProps> = ({
  current,
  target,
  percentage,
  startDate,
  duration,
  className,
  showDetails = true
}) => {
  const calculateDaysElapsed = () => {
    const start = new Date(startDate);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, elapsed);
  };
  
  const calculateDaysRemaining = () => {
    const daysElapsed = calculateDaysElapsed();
    return Math.max(0, duration - daysElapsed);
  };
  
  const daysElapsed = calculateDaysElapsed();
  const daysRemaining = calculateDaysRemaining();
  const timePercentage = Math.min(100, (daysElapsed / duration) * 100);
  
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getTimeColor = () => {
    if (timePercentage >= 90) return 'text-red-600 dark:text-red-400';
    if (timePercentage >= 75) return 'text-orange-600 dark:text-orange-400';
    if (timePercentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {current} / {target}
          </span>
        </div>
        
        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full',
              getProgressColor()
            )}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
          {percentage >= 100 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">Complete!</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {percentage}% complete
          </span>
          {percentage < 100 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {target - current} remaining
            </span>
          )}
        </div>
      </div>
      
      {/* Time Progress */}
      {showDetails && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time
              </span>
            </div>
            <span className={cn('text-sm font-semibold', getTimeColor())}>
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
            </span>
          </div>
          
          <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 dark:bg-gray-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${Math.min(100, timePercentage)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Day {daysElapsed + 1} of {duration}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(timePercentage)}% elapsed
            </span>
          </div>
        </div>
      )}
      
      {/* Performance Indicator */}
      {showDetails && percentage > 0 && timePercentage > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <TrendingUp className="w-4 h-4" />
          <span className="text-gray-600 dark:text-gray-400">
            {percentage > timePercentage ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                Ahead of schedule
              </span>
            ) : percentage < timePercentage ? (
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                Behind schedule
              </span>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                On track
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChallengeProgressBar;
