import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button, Input, Card, Textarea, Select } from '@/components/ui';
import communityService from '@/services/communityService';
import { CircleChallenge } from '@/types/community';

interface CreateChallengeModalProps {
  circleId: string;
  challenge?: CircleChallenge; // Optional: for editing
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  circleId,
  challenge,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'streak' | 'completion' | 'consistency'>('streak');
  const [target, setTarget] = useState('');
  const [pointsReward, setPointsReward] = useState('50');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Habit template fields
  const [enableHabitTemplate, setEnableHabitTemplate] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitCategory, setHabitCategory] = useState('health');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [habitIcon, setHabitIcon] = useState('🎯');
  const [habitReminderTime, setHabitReminderTime] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (challenge) {
      setTitle(challenge.title);
      setDescription(challenge.description || '');
      setType(challenge.type);
      setTarget(challenge.target.toString());
      setPointsReward(challenge.pointsReward.toString());
      setStartDate(new Date(challenge.startDate).toISOString().split('T')[0]);
      setEndDate(new Date(challenge.endDate).toISOString().split('T')[0]);
      
      // Populate habit template if it exists
      if (challenge.habitTemplate) {
        setEnableHabitTemplate(true);
        setHabitName(challenge.habitTemplate.name);
        setHabitDescription(challenge.habitTemplate.description || '');
        setHabitCategory(challenge.habitTemplate.category);
        setHabitFrequency(challenge.habitTemplate.frequency);
        setHabitIcon(challenge.habitTemplate.icon || '🎯');
        setHabitReminderTime(challenge.habitTemplate.reminderTime || '');
      }
    } else {
      // Set default start date to today
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      // Set default end date to 7 days from now
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setEndDate(nextWeek.toISOString().split('T')[0]);
    }
  }, [challenge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 100) {
      setError('Title must be 100 characters or less');
      return;
    }

    if (description.length > 500) {
      setError('Description must be 500 characters or less');
      return;
    }

    const targetNum = parseInt(target);
    if (isNaN(targetNum) || targetNum < 1) {
      setError('Target must be a positive number');
      return;
    }

    const pointsNum = parseInt(pointsReward);
    if (isNaN(pointsNum) || pointsNum < 1) {
      setError('Points reward must be a positive number');
      return;
    }

    if (!startDate || !endDate) {
      setError('Start and end dates are required');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setError('End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Validate habit template if enabled
    if (enableHabitTemplate) {
      if (!habitName.trim()) {
        setError('Habit name is required when habit template is enabled');
        setIsSubmitting(false);
        return;
      }
      if (habitName.length > 100) {
        setError('Habit name must be 100 characters or less');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const challengeData: any = {
        title: title.trim(),
        description: description.trim(),
        type,
        target: targetNum,
        pointsReward: pointsNum,
        startDate,
        endDate
      };

      // Add habit template if enabled
      if (enableHabitTemplate && habitName.trim()) {
        challengeData.habitTemplate = {
          name: habitName.trim(),
          description: habitDescription.trim(),
          category: habitCategory,
          frequency: habitFrequency,
          icon: habitIcon,
          reminderTime: habitReminderTime || undefined
        };
      }

      if (challenge) {
        // Update existing challenge
        await communityService.updateChallenge(circleId, challenge._id, challengeData);
      } else {
        // Create new challenge
        await communityService.createChallenge(circleId, challengeData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to ${challenge ? 'update' : 'create'} challenge`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {challenge ? '✏️ Edit Challenge' : '🎯 Create Challenge'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {challenge ? 'Update challenge details' : 'Create a new challenge to engage members'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 7-Day Streak Challenge"
                maxLength={100}
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the challenge..."
                rows={3}
                maxLength={500}
                className="w-full resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description.length}/500 characters
              </p>
            </div>

            {/* Type and Target Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Challenge Type *
                </label>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'streak' | 'completion' | 'consistency')}
                  options={[
                    { value: 'streak', label: 'Streak' },
                    { value: 'completion', label: 'Completion' },
                    { value: 'consistency', label: 'Consistency' }
                  ]}
                  className="w-full"
                />
              </div>

              {/* Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target *
                </label>
                <Input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g., 7"
                  min="1"
                  className="w-full"
                />
              </div>
            </div>

            {/* Points Reward */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Points Reward *
              </label>
              <Input
                type="number"
                value={pointsReward}
                onChange={(e) => setPointsReward(e.target.value)}
                placeholder="50"
                min="1"
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Community points awarded upon completion
              </p>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Habit Template Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="enableHabitTemplate"
                  checked={enableHabitTemplate}
                  onChange={(e) => setEnableHabitTemplate(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="enableHabitTemplate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Create Habit Template (Auto-create habit for participants)
                </label>
              </div>

              {enableHabitTemplate && (
                <div className="space-y-4 pl-6 border-l-2 border-primary-200 dark:border-primary-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    When participants join this challenge, a habit will be automatically created in their profile based on this template.
                  </p>

                  {/* Habit Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Habit Name *
                    </label>
                    <Input
                      value={habitName}
                      onChange={(e) => setHabitName(e.target.value)}
                      placeholder="e.g., Morning Exercise"
                      maxLength={100}
                      className="w-full"
                    />
                  </div>

                  {/* Habit Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Habit Description
                    </label>
                    <Textarea
                      value={habitDescription}
                      onChange={(e) => setHabitDescription(e.target.value)}
                      placeholder="Describe the habit..."
                      rows={2}
                      maxLength={500}
                      className="w-full resize-none"
                    />
                  </div>

                  {/* Category and Icon Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <Select
                        value={habitCategory}
                        onChange={(e) => setHabitCategory(e.target.value)}
                        options={[
                          { value: 'health', label: 'Health' },
                          { value: 'fitness', label: 'Fitness' },
                          { value: 'productivity', label: 'Productivity' },
                          { value: 'learning', label: 'Learning' },
                          { value: 'mindfulness', label: 'Mindfulness' },
                          { value: 'social', label: 'Social' },
                          { value: 'creativity', label: 'Creativity' },
                          { value: 'finance', label: 'Finance' },
                          { value: 'other', label: 'Other' }
                        ]}
                        className="w-full"
                      />
                    </div>

                    {/* Icon */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Icon
                      </label>
                      <Select
                        value={habitIcon}
                        onChange={(e) => setHabitIcon(e.target.value)}
                        options={[
                          { value: '🎯', label: '🎯 Target' },
                          { value: '💪', label: '💪 Strength' },
                          { value: '🏃', label: '🏃 Running' },
                          { value: '🧘', label: '🧘 Meditation' },
                          { value: '📚', label: '📚 Reading' },
                          { value: '💧', label: '💧 Water' },
                          { value: '🥗', label: '🥗 Healthy Food' },
                          { value: '😴', label: '😴 Sleep' },
                          { value: '✍️', label: '✍️ Writing' },
                          { value: '🎨', label: '🎨 Art' },
                          { value: '🎵', label: '🎵 Music' },
                          { value: '💼', label: '💼 Work' },
                          { value: '🌱', label: '🌱 Growth' },
                          { value: '❤️', label: '❤️ Health' },
                          { value: '🔥', label: '🔥 Streak' },
                          { value: '⭐', label: '⭐ Star' },
                          { value: '🌟', label: '🌟 Shine' },
                          { value: '💎', label: '💎 Diamond' },
                          { value: '🏆', label: '🏆 Trophy' },
                          { value: '🎓', label: '🎓 Learning' }
                        ]}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Frequency and Reminder Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frequency *
                      </label>
                      <Select
                        value={habitFrequency}
                        onChange={(e) => setHabitFrequency(e.target.value as 'daily' | 'weekly' | 'custom')}
                        options={[
                          { value: 'daily', label: 'Daily' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'custom', label: 'Custom' }
                        ]}
                        className="w-full"
                      />
                    </div>

                    {/* Reminder Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reminder Time
                      </label>
                      <Input
                        type="time"
                        value={habitReminderTime}
                        onChange={(e) => setHabitReminderTime(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !title.trim() || !target || !startDate || !endDate}
              >
                {isSubmitting 
                  ? (challenge ? 'Updating...' : 'Creating...') 
                  : (challenge ? 'Update Challenge' : 'Create Challenge')
                }
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
