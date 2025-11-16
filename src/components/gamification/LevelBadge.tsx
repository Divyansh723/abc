import React from 'react';
import { Crown, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui';
import { 
  calculateLevelInfo, 
  getLevelTitle, 
  getLevelColor,
  getNextMilestone 
} from '@/utils/xpUtils';
import { cn } from '@/utils/cn';

interface LevelBadgeProps {
  totalXP: number;
  variant?: 'compact' | 'detailed' | 'minimal';
  showProgress?: boolean;
  showTitle?: boolean;
  animated?: boolean;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  totalXP,
  variant = 'compact',
  showProgress = false,
  showTitle = true,
  animated = true,
  className,
}) => {
  const levelInfo = calculateLevelInfo(totalXP);
  const levelTitle = getLevelTitle(levelInfo.currentLevel);
  const levelColors = getLevelColor(levelInfo.currentLevel);
  const nextMilestone = getNextMilestone(levelInfo.currentLevel);

  const getLevelIcon = (level: number) => {
    if (level >= 50) return Crown;
    if (level >= 20) return Star;
    return Zap;
  };

  const Icon = getLevelIcon(levelInfo.currentLevel);

  if (variant === 'minimal') {
    return (
      <div
        style={{ 
          borderColor: levelColors.primary, 
          color: levelColors.primary,
          backgroundColor: `${levelColors.primary}10`
        }}
      >
        <Badge 
          variant="outline"
          className={cn(
            'flex items-center gap-1 font-semibold transition-all duration-200',
            animated && 'hover:scale-105',
            className
          )}
        >
          <Icon className="h-3 w-3" />
          <span>Lv. {levelInfo.currentLevel}</span>
        </Badge>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200',
        animated && 'hover:scale-105 hover:shadow-md',
        className
      )}
      style={{ 
        borderColor: levelColors.primary,
        backgroundColor: `${levelColors.primary}10`
      }}>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-r"
          style={{ background: `linear-gradient(135deg, ${levelColors.primary}, ${levelColors.secondary})` }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-bold text-gray-900 dark:text-white">
            Level {levelInfo.currentLevel}
          </div>
          {showTitle && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {levelTitle}
            </div>
          )}
        </div>
        {showProgress && (
          <div className="ml-2">
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
              {levelInfo.progressToNextLevel}%
            </div>
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r transition-all duration-500"
                style={{ 
                  width: `${levelInfo.progressToNextLevel}%`,
                  background: `linear-gradient(90deg, ${levelColors.primary}, ${levelColors.secondary})`
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 relative overflow-hidden',
      className
    )}>
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-5 bg-gradient-to-br"
        style={{ background: `linear-gradient(135deg, ${levelColors.primary}, ${levelColors.secondary})` }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-r shadow-lg',
                animated && 'animate-pulse'
              )}
              style={{ background: `linear-gradient(135deg, ${levelColors.primary}, ${levelColors.primary})` }}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                Level {levelInfo.currentLevel}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {levelTitle}
              </div>
            </div>
          </div>

          {/* Milestone indicator */}
          {levelInfo.currentLevel % 5 === 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <div className="text-yellow-600 dark:text-yellow-400">🏆</div>
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                Milestone
              </span>
            </div>
          )}
        </div>

        {showProgress && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Progress to Level {levelInfo.currentLevel + 1}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {levelInfo.progressToNextLevel}%
              </span>
            </div>
            
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full bg-gradient-to-r transition-all duration-1000 ease-out',
                  animated && 'animate-pulse'
                )}
                style={{ 
                  width: `${levelInfo.progressToNextLevel}%`,
                  background: `linear-gradient(90deg, ${levelColors.primary}, ${levelColors.secondary})`
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
              <span>{levelInfo.xpForCurrentLevel} XP</span>
              <span>{levelInfo.xpForNextLevel} XP to go</span>
              <span>{levelInfo.xpForNextLevel} XP</span>
            </div>

            {/* Next milestone */}
            {typeof nextMilestone === 'number' && typeof levelInfo.currentLevel === 'number' && nextMilestone > levelInfo.currentLevel && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    Next milestone: Level {typeof nextMilestone === 'number' ? nextMilestone : ''}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {typeof nextMilestone === 'number' && typeof levelInfo.currentLevel === 'number' ? nextMilestone - levelInfo.currentLevel : 0} levels to go
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};