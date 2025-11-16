import React from 'react';
import { Trophy, Lock } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { cn } from '@/utils/cn';

interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'streak' | 'completion' | 'consistency' | 'challenge' | 'milestone';
  requirement: string;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: Date | string;
  xpReward: number;
  workNeeded?: string;
}

interface AchievementProps {
  achievement: AchievementData;
  isUnlocked?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Achievement: React.FC<AchievementProps> = ({
  achievement,
  isUnlocked = false,
  showProgress = true,
  size = 'md',
  className,
}) => {
  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          gradient: 'from-yellow-400 via-orange-500 to-red-500',
          border: 'border-yellow-400',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          text: 'text-yellow-700 dark:text-yellow-300',
          glow: 'shadow-yellow-500/25',
        };
      case 'epic':
        return {
          gradient: 'from-purple-400 via-pink-500 to-red-500',
          border: 'border-purple-400',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          text: 'text-purple-700 dark:text-purple-300',
          glow: 'shadow-purple-500/25',
        };
      case 'rare':
        return {
          gradient: 'from-blue-400 via-cyan-500 to-teal-500',
          border: 'border-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-700 dark:text-blue-300',
          glow: 'shadow-blue-500/25',
        };
      default: // common
        return {
          gradient: 'from-gray-400 via-gray-500 to-gray-600',
          border: 'border-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          glow: 'shadow-gray-500/25',
        };
    }
  };



  const rarityConfig = getRarityConfig(achievement.rarity);

  const progress = achievement.progress || 0;
  const maxProgress = achievement.maxProgress || 100;
  const progressPercentage = maxProgress > 0 ? Math.min(100, (progress / maxProgress) * 100) : 0;

  const sizeClasses = {
    sm: {
      card: 'p-3',
      icon: 'w-8 h-8',
      iconSize: 'h-4 w-4',
      title: 'text-sm',
      description: 'text-xs',
    },
    md: {
      card: 'p-4',
      icon: 'w-12 h-12',
      iconSize: 'h-6 w-6',
      title: 'text-base',
      description: 'text-sm',
    },
    lg: {
      card: 'p-6',
      icon: 'w-16 h-16',
      iconSize: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300',
      isUnlocked 
        ? `${rarityConfig.bg} ${rarityConfig.border} border-2 shadow-lg ${rarityConfig.glow}` 
        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60',
      'hover:scale-105 cursor-pointer',
      classes.card,
      className
    )}>
      {/* Rarity indicator */}
      {isUnlocked && (
        <div className="absolute top-2 right-2">
          <Badge 
            variant="outline" 
            size="sm"
            className={cn('capitalize font-semibold', rarityConfig.text, rarityConfig.border)}
          >
            {achievement.rarity}
          </Badge>
        </div>
      )}

      {/* Locked overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 dark:bg-gray-900/40">
          <Lock className="h-8 w-8 text-gray-500 dark:text-gray-400" />
        </div>
      )}

      <div className="space-y-4">
        {/* Header with icon and title */}
        <div className="flex items-start gap-4">
          <div className={cn(
            'rounded-full flex items-center justify-center flex-shrink-0',
            classes.icon,
            isUnlocked 
              ? `bg-gradient-to-br ${rarityConfig.gradient} text-white shadow-lg`
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
          )}>
            {isUnlocked ? (
              <span className="text-2xl">{achievement.icon}</span>
            ) : (
              <span className="text-2xl opacity-50">{achievement.icon}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold mb-1',
              classes.title,
              isUnlocked 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-700 dark:text-gray-300'
            )}>
              {achievement.name}
            </h3>
            
            <p className={cn(
              'mb-2 line-clamp-2',
              classes.description,
              isUnlocked 
                ? 'text-gray-600 dark:text-gray-300' 
                : 'text-gray-500 dark:text-gray-400'
            )}>
              {achievement.description}
            </p>

            {/* XP Reward */}
            <div className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              isUnlocked 
                ? `${rarityConfig.bg} ${rarityConfig.text}` 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            )}>
              <Trophy className="h-3 w-3" />
              <span>{achievement.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Requirement */}
        <div className={cn(
          'text-xs font-medium p-2 rounded-lg border',
          isUnlocked 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
        )}>
          {isUnlocked ? '✅' : '📋'} {achievement.requirement}
        </div>

        {/* Work Needed (for locked achievements) */}
        {!isUnlocked && achievement.workNeeded && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-1">
              💡 How to unlock this achievement:
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed">
              {achievement.workNeeded}
            </div>
          </div>
        )}

        {/* Progress bar (if not unlocked and has progress) */}
        {!isUnlocked && showProgress && achievement.maxProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-bold text-primary-600 dark:text-primary-400">
                {progress}/{maxProgress}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-center font-medium text-primary-600 dark:text-primary-400">
              {progressPercentage.toFixed(1)}% complete
            </div>
          </div>
        )}

        {/* Completion celebration (for unlocked achievements) */}
        {isUnlocked && achievement.unlockedAt && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
              🎉 Achievement Unlocked!
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Completed on {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Shine effect for unlocked achievements */}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
      )}
    </Card>
  );
};