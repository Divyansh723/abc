import React from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui';
import { 
  calculateLevelInfo, 
  getLevelTitle, 
  getLevelColor, 
  formatXP
} from '@/utils/xpUtils';
import { cn } from '@/utils/cn';

interface XPBarProps {
  totalXP: number;
  animated?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const XPBar: React.FC<XPBarProps> = ({
  totalXP,
  animated = true,
  showDetails = true,
  size = 'md',
  className,
}) => {
  const levelInfo = calculateLevelInfo(totalXP);
  const levelTitle = getLevelTitle(levelInfo.currentLevel);
  const levelColors = getLevelColor(levelInfo.currentLevel);

  const sizeClasses = {
    sm: {
      container: 'p-2 sm:p-3',
      bar: 'h-2',
      text: 'text-xs sm:text-sm',
      level: 'text-base sm:text-lg',
      icon: 'h-3 w-3 sm:h-4 sm:w-4',
    },
    md: {
      container: 'p-3 sm:p-4',
      bar: 'h-2 sm:h-3',
      text: 'text-xs sm:text-sm',
      level: 'text-lg sm:text-xl',
      icon: 'h-4 w-4 sm:h-5 sm:w-5',
    },
    lg: {
      container: 'p-4 sm:p-5 md:p-6',
      bar: 'h-3 sm:h-4',
      text: 'text-sm sm:text-base',
      level: 'text-xl sm:text-2xl',
      icon: 'h-5 w-5 sm:h-6 sm:w-6',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden',
      classes.container,
      className
    )}>
      {/* Background gradient */}
      <div 
        className={cn(
          'absolute inset-0 opacity-5 bg-gradient-to-r',
          levelColors.gradient
        )} 
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div 
              className={cn(
                'rounded-full flex items-center justify-center text-white bg-gradient-to-r flex-shrink-0',
                levelColors.gradient,
                size === 'sm' ? 'w-7 h-7 sm:w-8 sm:h-8' : size === 'md' ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12'
              )}
            >
              <Zap className={classes.icon} />
            </div>
            <div className="min-w-0 flex-1">
              <div className={cn('font-bold text-gray-900 dark:text-white', classes.level)}>
                Level {levelInfo.currentLevel}
              </div>
              {showDetails && (
                <div className={cn('text-gray-600 dark:text-gray-400 truncate', classes.text)}>
                  {levelTitle}
                </div>
              )}
            </div>
          </div>

          <Badge 
            variant="outline" 
            className={cn(
              'font-semibold flex-shrink-0',
              classes.text
            )}
          >
            {formatXP(totalXP)}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          {showDetails && (
            <div className={cn('flex justify-between gap-2', classes.text)}>
              <span className="text-gray-600 dark:text-gray-400 truncate">
                Progress to Level {levelInfo.currentLevel + 1}
              </span>
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">
                {formatXP(levelInfo.xpForNextLevel - levelInfo.currentXP)} to go
              </span>
            </div>
          )}
          
          <div className={cn(
            'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
            classes.bar
          )}>
            <div
              className={cn(
                'h-full bg-gradient-to-r transition-all duration-1000 ease-out rounded-full',
                levelColors.gradient,
                animated && 'animate-pulse'
              )}
              style={{ 
                width: `${levelInfo.progressPercentage}%`,
                transition: animated ? 'width 1s ease-out' : 'none'
              }}
            />
          </div>

          {showDetails && (
            <div className={cn('flex items-center justify-between', classes.text)}>
              <span className="text-gray-500 dark:text-gray-500">
                {formatXP(levelInfo.xpForCurrentLevel)}
              </span>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-3 w-3" />
                <span>{Math.round(levelInfo.progressPercentage)}%</span>
              </div>
              <span className="text-gray-500 dark:text-gray-500">
                {formatXP(levelInfo.xpForNextLevel)}
              </span>
            </div>
          )}
        </div>

        {/* Level milestone indicator */}
        {showDetails && levelInfo.currentLevel % 5 === 0 && (
          <div className="mt-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <div className="text-yellow-600 dark:text-yellow-400 text-lg">🏆</div>
              <span className={cn('text-yellow-700 dark:text-yellow-300 font-medium', classes.text)}>
                Milestone Level Achieved!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};