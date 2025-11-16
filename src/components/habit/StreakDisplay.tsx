import React from 'react';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { 
  formatStreakText, 
  getStreakEmoji, 
  getStreakMilestones,
  type StreakData 
} from '@/utils/streakUtils';
import { cn } from '@/utils/cn';

interface StreakDisplayProps {
  streakData: StreakData;
  habitName: string;
  compact?: boolean;
  showMilestones?: boolean;
  className?: string;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streakData,
  habitName,
  compact = false,
  showMilestones = true,
  className,
}) => {
  const { currentStreak, longestStreak } = streakData;
  const milestones = getStreakMilestones(currentStreak, longestStreak);
  const streakEmoji = getStreakEmoji(currentStreak);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1">
          <span className="text-lg">{streakEmoji}</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currentStreak}
          </span>
        </div>
        {currentStreak > 0 && (
          <Badge variant="outline" size="sm">
            {formatStreakText(currentStreak)}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Background gradient based on streak */}
      <div className={cn(
        'absolute inset-0 opacity-10',
        currentStreak === 0 && 'bg-gray-200 dark:bg-gray-700',
        currentStreak > 0 && currentStreak < 7 && 'bg-gradient-to-br from-orange-400 to-red-500',
        currentStreak >= 7 && currentStreak < 30 && 'bg-gradient-to-br from-blue-400 to-purple-500',
        currentStreak >= 30 && 'bg-gradient-to-br from-yellow-400 to-orange-500'
      )} />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
              currentStreak === 0 && 'bg-gray-100 dark:bg-gray-800',
              currentStreak > 0 && currentStreak < 7 && 'bg-gradient-to-br from-orange-400 to-red-500',
              currentStreak >= 7 && currentStreak < 30 && 'bg-gradient-to-br from-blue-400 to-purple-500',
              currentStreak >= 30 && 'bg-gradient-to-br from-yellow-400 to-orange-500'
            )}>
              {streakEmoji}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Streak
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {habitName}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentStreak === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-warning-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Best
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {longestStreak}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Next Goal
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {milestones.nextMilestone || '∞'}
            </div>
          </div>
        </div>

        {/* Progress to next milestone */}
        {milestones.nextMilestone && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Progress to {milestones.nextMilestone} days
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {milestones.daysToNextMilestone} days to go
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(currentStreak / milestones.nextMilestone) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Milestones achieved */}
        {showMilestones && milestones.currentMilestones.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Milestones Achieved
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {milestones.currentMilestones.map((milestone) => (
                <Badge
                  key={milestone}
                  variant="outline"
                  size="sm"
                  className="text-success-600 border-success-600 bg-success-50 dark:bg-success-900/20"
                >
                  {milestone} days
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Encouragement message */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
            {currentStreak === 0 && "Every journey begins with a single step. Start your streak today!"}
            {currentStreak === 1 && "Great start! One day down, keep the momentum going!"}
            {currentStreak >= 2 && currentStreak < 7 && "You're building momentum! Keep it up!"}
            {currentStreak >= 7 && currentStreak < 14 && "One week strong! You're developing a real habit!"}
            {currentStreak >= 14 && currentStreak < 30 && "Two weeks in! This is becoming second nature!"}
            {currentStreak >= 30 && "Incredible dedication! You're a habit master!"}
          </p>
        </div>
      </div>
    </Card>
  );
};