import React, { useState } from 'react';
import { Plus, Calendar, Search } from 'lucide-react';
import { Button, Card, Input, Select } from '@/components/ui';
import { HabitCard } from './HabitCard';
import { HabitForm } from './HabitForm';
import { StreakDisplay } from './StreakDisplay';
import { useHabits } from '@/hooks/useHabits';
import { type Habit } from '@/types/habit';
import { type HabitFormData } from '@/utils/validationUtils';

interface DailyHabitChecklistProps {
  showCreateButton?: boolean;
  compact?: boolean;
  maxItems?: number;
  showStreaks?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'fitness', label: 'Fitness & Exercise' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'learning', label: 'Learning & Growth' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'social', label: 'Social & Relationships' },
  { value: 'creativity', label: 'Creativity & Arts' },
  { value: 'finance', label: 'Finance & Money' },
  { value: 'other', label: 'Other' },
];

export const DailyHabitChecklist: React.FC<DailyHabitChecklistProps> = ({
  showCreateButton = true,
  compact = false,
  maxItems,
  showStreaks = false,
}) => {
  const {
    isLoading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    isHabitCompletedToday,
    getActiveHabits,
    isHabitVisibleToday,
    getTotalStats,
  } = useHabits();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFormLoading, setIsFormLoading] = useState(false);

  const activeHabits = getActiveHabits();
  const totalStats = getTotalStats();

  // Filter habits based on search and category (use all active habits, not just displayable)
  const filteredHabits = activeHabits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         habit.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Limit items if maxItems is specified
  const displayHabits = maxItems ? filteredHabits.slice(0, maxItems) : filteredHabits;

  const handleCreateHabit = async (data: HabitFormData) => {
    setIsFormLoading(true);
    try {
      await createHabit(data);
      setIsFormOpen(false);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdateHabit = async (data: HabitFormData) => {
    if (!editingHabit) return;
    
    setIsFormLoading(true);
    try {
      await updateHabit(editingHabit.id, data);
      setEditingHabit(null);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      await completeHabit(habitId);
    } catch (error) {
      console.error('Failed to complete habit:', error);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(null);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-8">
        <p className="text-error-600 dark:text-error-400 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header with Stats */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span>Today's Habits</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
              {totalStats.completedToday} of {totalStats.totalHabits} completed ({totalStats.completionRate}%)
            </p>
          </div>

          {showCreateButton && (
            <Button
              variant="primary"
              onClick={() => setIsFormOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Add Habit
            </Button>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {!compact && totalStats.totalHabits > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-success-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalStats.completionRate}%` }}
          />
        </div>
      )}

      {/* Filters */}
      {!compact && activeHabits.length > 3 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={CATEGORY_OPTIONS}
            />
          </div>
        </div>
      )}

      {/* Habits List */}
      {displayHabits.length === 0 ? (
        <Card className="text-center py-12">
          {activeHabits.length === 0 ? (
            <>
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No habits yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first habit to start building better routines
              </p>
              {showCreateButton && (
                <Button
                  variant="primary"
                  onClick={() => setIsFormOpen(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Create Your First Habit
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No habits found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Today's Habits Section */}
          {(() => {
            const todaysHabits = displayHabits.filter(habit => isHabitVisibleToday(habit));
            const upcomingHabits = displayHabits.filter(habit => !isHabitVisibleToday(habit));
            
            return (
              <>
                {/* Active Habits for Today */}
                {todaysHabits.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary-500"></div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Today's Habits ({todaysHabits.length})
                      </h3>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="space-y-4">
                      {todaysHabits.map((habit) => {
                        const streakData = {
                          currentStreak: habit.currentStreak,
                          longestStreak: habit.longestStreak,
                          canUseForgiveness: false,
                          daysSinceLastCompletion: 0,
                        };
                        return (
                          <div key={habit.id} className="space-y-2">
                            <HabitCard
                              habit={habit}
                              onComplete={handleCompleteHabit}
                              onEdit={handleEditHabit}
                              onDelete={handleDeleteHabit}
                              isCompletedToday={isHabitCompletedToday(habit.id)}
                              canComplete={!isHabitCompletedToday(habit.id)}
                              compact={compact}
                            />
                            {showStreaks && habit.currentStreak > 0 && (
                              <StreakDisplay
                                streakData={streakData}
                                habitName={habit.name}
                                compact
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upcoming Habits Section */}
                {upcomingHabits.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Upcoming Habits ({upcomingHabits.length})
                      </h3>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="space-y-4 opacity-60">
                      {upcomingHabits.map((habit) => {
                        const streakData = {
                          currentStreak: habit.currentStreak,
                          longestStreak: habit.longestStreak,
                          canUseForgiveness: false,
                          daysSinceLastCompletion: 0,
                        };
                        return (
                          <div key={habit.id} className="space-y-2">
                            <HabitCard
                              habit={habit}
                              onComplete={handleCompleteHabit}
                              onEdit={handleEditHabit}
                              onDelete={handleDeleteHabit}
                              isCompletedToday={isHabitCompletedToday(habit.id)}
                              canComplete={false}
                              compact={compact}
                            />
                            {showStreaks && habit.currentStreak > 0 && (
                              <StreakDisplay
                                streakData={streakData}
                                habitName={habit.name}
                                compact
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Show more button if items are limited */}
          {maxItems && filteredHabits.length > maxItems && (
            <div className="text-center pt-4">
              <Button variant="outline">
                View All {filteredHabits.length} Habits
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {!compact && activeHabits.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card padding="sm" className="text-center p-3 sm:p-4 min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
              {totalStats.currentStreaks}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
              Active Streaks
            </div>
          </Card>
          <Card padding="sm" className="text-center p-3 sm:p-4 min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-success-600 dark:text-success-400">
              {totalStats.totalCompletions}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
              Total Completions
            </div>
          </Card>
          <Card padding="sm" className="text-center p-3 sm:p-4 min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-warning-600 dark:text-warning-400">
              {totalStats.longestStreak}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
              Longest Streak
            </div>
          </Card>
          <Card padding="sm" className="text-center p-3 sm:p-4 min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-secondary-600 dark:text-secondary-400">
              {totalStats.averageConsistency}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
              Avg Consistency
            </div>
          </Card>
        </div>
      )}

      {/* Habit Form Modal */}
      <HabitForm
        isOpen={isFormOpen || !!editingHabit}
        onClose={handleCloseForm}
        onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
        habit={editingHabit}
        isLoading={isFormLoading}
      />
    </div>
  );
};