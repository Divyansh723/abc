import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Target, 
  Clock, 
 
  Palette, 

  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Card, 
  Badge,
  Modal,

  ModalFooter
} from '@/components/ui';
import { habitSchema, type HabitFormData } from '@/utils/validationUtils';
import { type Habit, type HabitCategory } from '@/types/habit';
// import { COMMON_TIMEZONES } from '@/utils/timezoneUtils';
import DaySelector from './DaySelector';

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormData) => Promise<void>;
  habit?: Habit | null;
  isLoading?: boolean;
}

const HABIT_CATEGORIES: { value: HabitCategory; label: string; color: string }[] = [
  { value: 'health', label: 'Health & Wellness', color: 'bg-green-500' },
  { value: 'fitness', label: 'Fitness & Exercise', color: 'bg-blue-500' },
  { value: 'productivity', label: 'Productivity', color: 'bg-purple-500' },
  { value: 'learning', label: 'Learning & Growth', color: 'bg-yellow-500' },
  { value: 'mindfulness', label: 'Mindfulness', color: 'bg-indigo-500' },
  { value: 'social', label: 'Social & Relationships', color: 'bg-pink-500' },
  { value: 'creativity', label: 'Creativity & Arts', color: 'bg-orange-500' },
  { value: 'finance', label: 'Finance & Money', color: 'bg-emerald-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

const HABIT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const HABIT_ICONS = [
  '🎯', '💪', '📚', '🧘', '🏃', '💡', '🎨', '💰', '🌱', '⭐',
  '🔥', '⚡', '🚀', '💎', '🏆', '🎪', '🌟', '🎭', '🎵', '🎲'
];

const HABIT_TEMPLATES = [
  {
    name: 'Morning Exercise',
    category: 'fitness' as HabitCategory,
    frequency: 'daily' as const,
    reminderTime: '07:00',
    color: '#3B82F6',
    icon: '💪',
    description: 'Start your day with 30 minutes of exercise'
  },
  {
    name: 'Read for 20 minutes',
    category: 'learning' as HabitCategory,
    frequency: 'daily' as const,
    reminderTime: '20:00',
    color: '#10B981',
    icon: '📚',
    description: 'Daily reading to expand knowledge'
  },
  {
    name: 'Meditation',
    category: 'mindfulness' as HabitCategory,
    frequency: 'daily' as const,
    reminderTime: '08:00',
    color: '#8B5CF6',
    icon: '🧘',
    description: '10 minutes of mindfulness meditation'
  },
  {
    name: 'Drink 8 glasses of water',
    category: 'health' as HabitCategory,
    frequency: 'daily' as const,
    reminderTime: '09:00',
    color: '#06B6D4',
    icon: '💧',
    description: 'Stay hydrated throughout the day'
  }
];

export const HabitForm: React.FC<HabitFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  habit,
  isLoading = false,
}) => {
  const [_selectedTemplate, setSelectedTemplate] = useState<typeof HABIT_TEMPLATES[0] | null>(null);
  const [showTemplates, setShowTemplates] = useState(!habit);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = !!habit;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: habit ? {
      name: habit.name,
      description: habit.description || '',
      category: habit.category,
      frequency: habit.frequency,
      reminderTime: habit.reminderTime || '',
      reminderEnabled: habit.reminderEnabled,
      color: habit.color,
      icon: habit.icon,
      customFrequency: habit.customFrequency || { daysOfWeek: [], timesPerWeek: 3 },
    } : {
      frequency: 'daily',
      reminderEnabled: true,
      color: HABIT_COLORS[0],
      icon: HABIT_ICONS[0],
      customFrequency: { daysOfWeek: [], timesPerWeek: 3 },
    },
  });

  const watchedValues = watch();

  // Reset form when habit prop changes (for editing)
  useEffect(() => {
    if (habit) {
      reset({
        name: habit.name,
        description: habit.description || '',
        category: habit.category,
        frequency: habit.frequency,
        reminderTime: habit.reminderTime || '',
        reminderEnabled: habit.reminderEnabled,
        color: habit.color,
        icon: habit.icon,
        customFrequency: habit.customFrequency || { daysOfWeek: [], timesPerWeek: 3 },
      });
    }
  }, [habit, reset]);

  const handleFormSubmit = async (data: HabitFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save habit');
    }
  };

  const applyTemplate = (template: typeof HABIT_TEMPLATES[0]) => {
    setValue('name', template.name);
    setValue('description', template.description);
    setValue('category', template.category);
    setValue('frequency', template.frequency);
    setValue('reminderTime', template.reminderTime);
    setValue('color', template.color);
    setValue('icon', template.icon);
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleClose = () => {
    reset();
    setSubmitError(null);
    setSelectedTemplate(null);
    setShowTemplates(!habit);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Habit' : 'Create New Habit'}
      size="lg"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Templates Section */}
        {showTemplates && !isEditing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose a Template
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplates(false)}
              >
                Skip Templates
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HABIT_TEMPLATES.map((template, index) => (
                <Card
                  key={index}
                  className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  padding="sm"
                  clickable
                  onClick={() => applyTemplate(template)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: template.color }}
                    >
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-error-600 dark:text-error-400 flex-shrink-0" />
            <p className="text-sm text-error-700 dark:text-error-300">{submitError}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Basic Information
          </h3>

          <Input
            label="Habit Name"
            placeholder="e.g., Morning Exercise, Read for 20 minutes"
            error={errors.name?.message}
            {...register('name')}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Add more details about your habit..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />

          <Select
            label="Category"
            options={HABIT_CATEGORIES.map(cat => ({
              value: cat.value,
              label: cat.label,
            }))}
            error={errors.category?.message}
            {...register('category')}
          />
        </div>

        {/* Frequency & Reminders */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Frequency & Reminders
          </h3>

          <Select
            label="Frequency"
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'custom', label: 'Custom' },
            ]}
            error={errors.frequency?.message}
            {...register('frequency')}
          />

          {/* Custom Frequency - Day Selection */}
          {watchedValues.frequency === 'custom' && (
            <div className="space-y-2">
              <DaySelector
                selectedDays={watchedValues.customFrequency?.daysOfWeek || []}
                onChange={(days) => setValue('customFrequency', {
                  ...watchedValues.customFrequency,
                  daysOfWeek: days
                })}
              />
              {errors.customFrequency?.daysOfWeek && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {errors.customFrequency.daysOfWeek.message}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="reminderEnabled"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('reminderEnabled')}
            />
            <label htmlFor="reminderEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable reminders
            </label>
          </div>

          {watchedValues.reminderEnabled && (
            <Input
              label="Reminder Time"
              type="time"
              leftIcon={<Clock className="h-4 w-4" />}
              error={errors.reminderTime?.message}
              {...register('reminderTime')}
            />
          )}
        </div>

        {/* Appearance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </h3>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    watchedValues.color === color
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setValue('color', color)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                    watchedValues.icon === icon
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-110'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105'
                  }`}
                  onClick={() => setValue('icon', icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: watchedValues.color }}
              >
                {watchedValues.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {watchedValues.name || 'Habit Name'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" size="sm">
                    {HABIT_CATEGORIES.find(cat => cat.value === watchedValues.category)?.label || 'Category'}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {watchedValues.frequency}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || isLoading}
          >
            {isEditing ? 'Update Habit' : 'Create Habit'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};