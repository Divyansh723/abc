import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Clock, 
  Flame,
  MoreVertical,
  Calendar
} from 'lucide-react';
import { Button, Card, Badge, ConfirmDialog } from '@/components/ui';
import { CompletionButton } from './CompletionButton';
import { type Habit } from '@/types/habit';
import { cn } from '@/utils/cn';
// import { getCurrentDateInTimezone } from '@/utils/dateUtils';
// import { getUserTimezone } from '@/utils/timezoneUtils';

interface HabitCardProps {
  habit: Habit;
  onComplete?: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  isCompleted?: boolean;
  isCompletedToday?: boolean;
  canComplete?: boolean;
  showActions?: boolean;
  compact?: boolean;
  variant?: 'default' | 'detailed' | 'minimal';
  userTimezone?: string;
  showStreakAnimation?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onComplete,
  onEdit,
  onDelete,
  isCompleted: _isCompleted = false,
  isCompletedToday = false,
  canComplete = true,
  showActions = true,
  compact = false,
  variant = 'default',
  userTimezone: _userTimezone,
  showStreakAnimation = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // const timezone = userTimezone || getUserTimezone();

  const handleComplete = (_habitId?: string) => {
    if (!canComplete || isCompletedToday || !onComplete) return;
    onComplete(habit.id);
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(habit);
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (!onDelete) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(habit.id);
    }
    setShowDeleteConfirm(false);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      fitness: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      productivity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      learning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      mindfulness: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      social: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      creativity: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      finance: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <CompletionButton
          habitId={habit.id}
          habitName={habit.name}
          isCompleted={isCompletedToday}
          onComplete={handleComplete}
          disabled={!canComplete}
          size="sm"
          showAnimation={showStreakAnimation}
        />

        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
          style={{ backgroundColor: habit.color }}
        >
          {habit.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-medium text-sm break-words',
            isCompletedToday 
              ? 'text-gray-500 dark:text-gray-400 line-through' 
              : 'text-gray-900 dark:text-white'
          )}>
            {habit.name}
          </h3>
        </div>

        {habit.currentStreak > 0 && (
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-medium">{habit.currentStreak}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="relative group hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Completion Button - only show for default variant */}
        {variant === 'default' && (
          <div className="mt-1">
            <CompletionButton
              habitId={habit.id}
              habitName={habit.name}
              isCompleted={isCompletedToday}
              onComplete={handleComplete}
              disabled={!canComplete}
              size="lg"
              showAnimation={showStreakAnimation}
            />
          </div>
        )}

        {/* Habit Icon */}
        <div 
          className={cn(
            "rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm",
            variant === 'detailed' ? "w-12 h-12 text-xl" : "w-16 h-16 text-2xl"
          )}
          style={{ backgroundColor: habit.color }}
        >
          {habit.icon}
        </div>

        {/* Habit Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'text-base sm:text-lg font-semibold mb-1 break-words',
                isCompletedToday 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-900 dark:text-white'
              )}>
                {habit.name}
              </h3>
              
              {habit.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {habit.description}
                </p>
              )}

              <div className="flex items-center flex-wrap gap-2 mb-3">
                <Badge 
                  variant="outline" 
                  size="sm"
                  className={getCategoryColor(habit.category)}
                >
                  {habit.category}
                </Badge>
                <Badge variant="outline" size="sm" className="whitespace-nowrap">
                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                  {habit.frequency}
                </Badge>
                {habit.reminderEnabled && habit.reminderTime && (
                  <Badge variant="outline" size="sm" className="whitespace-nowrap">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    {habit.reminderTime}
                  </Badge>
                )}
                {habit.isChallengeHabit && (
                  <Badge 
                    variant="outline" 
                    size="sm" 
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 whitespace-nowrap"
                  >
                    🎯 Challenge Habit
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className={cn(
                "flex items-center flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
              )}>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {habit.currentStreak}
                  </span>
                  <span>day streak</span>
                </div>
                <div className="whitespace-nowrap">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(habit.consistencyRate)}%
                  </span>
                  <span className="ml-1">consistency</span>
                </div>
                <div className="whitespace-nowrap">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {habit.totalCompletions}
                  </span>
                  <span className="ml-1">completions</span>
                </div>
                {variant === 'detailed' && (
                  <>
                    <div className="whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {habit.longestStreak}
                      </span>
                      <span className="ml-1">best streak</span>
                    </div>
                    <div className="whitespace-nowrap">
                      <span>Status:</span>
                      <span className={cn(
                        "font-medium ml-1",
                        habit.active 
                          ? "text-success-600 dark:text-success-400" 
                          : "text-warning-600 dark:text-warning-400"
                      )}>
                        {habit.active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            {showActions && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Animation Overlay */}
      {isCompletedToday && showStreakAnimation && (
        <div className="absolute inset-0 bg-success-500/10 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-success-500 text-4xl animate-bounce">
            ✨
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Habit"
        message={
          habit.isChallengeHabit
            ? '⚠️ This habit is linked to a community challenge. Deleting it will remove you from the challenge. Are you sure you want to continue?'
            : 'Are you sure you want to delete this habit? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </Card>
  );
};