import React, { useState } from 'react';
import { Trophy, Star } from 'lucide-react';
import { Select, Card, Badge } from '@/components/ui';
import { Achievement } from './Achievement';
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

interface AchievementGridProps {
  achievements: AchievementData[];
  unlockedAchievements: string[];
  className?: string;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Achievements' },
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'locked', label: 'Locked' },
  { value: 'streak', label: 'Streak Achievements' },
  { value: 'completion', label: 'Completion Achievements' },
  { value: 'consistency', label: 'Consistency Achievements' },
  { value: 'challenge', label: 'Challenge Achievements' },
  { value: 'milestone', label: 'Milestone Achievements' },
];

const RARITY_OPTIONS = [
  { value: 'all', label: 'All Rarities' },
  { value: 'common', label: 'Common' },
  { value: 'rare', label: 'Rare' },
  { value: 'epic', label: 'Epic' },
  { value: 'legendary', label: 'Legendary' },
];

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  unlockedAchievements,
  className,
}) => {
  const [filterBy, setFilterBy] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');

  const unlockedSet = new Set(unlockedAchievements);

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    const isUnlocked = unlockedSet.has(achievement.id);

    // Status filter
    if (filterBy === 'unlocked' && !isUnlocked) return false;
    if (filterBy === 'locked' && isUnlocked) return false;
    if (filterBy !== 'all' && filterBy !== 'unlocked' && filterBy !== 'locked') {
      if (achievement.category !== filterBy) return false;
    }

    // Rarity filter
    if (rarityFilter !== 'all' && achievement.rarity !== rarityFilter) {
      return false;
    }

    return true;
  });

  // Sort achievements (unlocked first, then by rarity)
  const sortedAchievements = filteredAchievements.sort((a, b) => {
    const aUnlocked = unlockedSet.has(a.id);
    const bUnlocked = unlockedSet.has(b.id);

    if (aUnlocked !== bUnlocked) {
      return bUnlocked ? 1 : -1; // Unlocked first
    }

    // Then by rarity (legendary > epic > rare > common)
    const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
    return rarityOrder[b.rarity] - rarityOrder[a.rarity];
  });

  const getStats = () => {
    const total = achievements.length;
    const unlocked = unlockedAchievements.length;
    const totalXP = achievements
      .filter(a => unlockedSet.has(a.id))
      .reduce((sum, a) => sum + a.xpReward, 0);

    const rarityStats = achievements.reduce((acc, achievement) => {
      const isUnlocked = unlockedSet.has(achievement.id);
      if (!acc[achievement.rarity]) {
        acc[achievement.rarity] = { total: 0, unlocked: 0 };
      }
      acc[achievement.rarity].total++;
      if (isUnlocked) {
        acc[achievement.rarity].unlocked++;
      }
      return acc;
    }, {} as Record<string, { total: number; unlocked: number }>);

    return { total, unlocked, totalXP, rarityStats };
  };

  const stats = getStats();
  const completionRate = stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0;



  if (achievements.length === 0) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Achievements Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start building habits to unlock your first achievements!
        </p>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Your Achievements
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Unlock badges and milestones as you build consistent habits
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✅ {stats.unlocked} Unlocked
            </span>
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              🔒 {stats.total - stats.unlocked} Locked
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              🏆 {stats.totalXP} XP Earned
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge 
            variant={completionRate >= 80 ? 'primary' : completionRate >= 50 ? 'secondary' : 'outline'}
            className="font-semibold text-lg px-3 py-1"
          >
            {completionRate}% Complete
          </Badge>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats.total - stats.unlocked} achievements to unlock
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.unlocked}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Unlocked
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {stats.totalXP}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              XP Earned
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
              {stats.rarityStats.legendary?.unlocked || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Legendary
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600 dark:text-success-400">
              {completionRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Complete
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </Card>

      {/* Next Achievements to Work On */}
      {stats.unlocked < stats.total && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Next Achievements to Unlock
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAchievements
              .filter(a => !unlockedSet.has(a.id))
              .slice(0, 4)
              .map((achievement) => (
                <div key={achievement.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {achievement.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {achievement.description}
                      </p>
                      {achievement.workNeeded && (
                        <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded px-2 py-1">
                          💡 {achievement.workNeeded}
                        </div>
                      )}
                      {achievement.maxProgress && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress || 0}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${Math.min(100, ((achievement.progress || 0) / achievement.maxProgress) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      +{achievement.xpReward} XP
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Rarity Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(stats.rarityStats).map(([rarity, data]) => (
          <Card key={rarity} padding="sm" className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Star className={cn(
                'h-4 w-4',
                rarity === 'legendary' && 'text-yellow-500',
                rarity === 'epic' && 'text-purple-500',
                rarity === 'rare' && 'text-blue-500',
                rarity === 'common' && 'text-gray-500'
              )} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {rarity}
              </span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {data.unlocked}/{data.total}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            options={FILTER_OPTIONS}
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            options={RARITY_OPTIONS}
          />
        </div>
      </div>

      {/* Achievement Grid */}
      {filteredAchievements.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Achievements Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filter criteria
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedAchievements.map((achievement) => (
            <Achievement
              key={achievement.id}
              achievement={achievement}
              isUnlocked={unlockedSet.has(achievement.id)}
              showProgress={!unlockedSet.has(achievement.id)}
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  );
};