import React, { useState } from 'react';
import { Modal, Button, Input, Select, Textarea } from '@/components/ui';
import { useHabits } from '@/hooks/useHabits';
import { type Habit } from '@/types/habit';
import { type HabitFormData } from '@/utils/validationUtils';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit | null;
  mode: 'create' | 'edit';
}

const categories = [
  { value: 'health', label: '🏥 Health' },
  { value: 'fitness', label: '💪 Fitness' },
  { value: 'productivity', label: '⚡ Productivity' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'mindfulness', label: '🧘 Mindfulness' },
  { value: 'social', label: '👥 Social' },
  { value: 'creativity', label: '🎨 Creativity' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'other', label: '📝 Other' }
];

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' }
];

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

const icons = ['💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '📝', '🎯', '⚡'];

const habitTemplates = [
  {
    name: 'Morning Exercise',
    description: '30 minutes of physical activity to start your day',
    category: 'fitness' as const,
    frequency: 'daily' as const,
    color: '#3B82F6',
    icon: '🏃',
    reminderTime: '07:00'
  },
  {
    name: 'Drink Water',
    description: 'Stay hydrated throughout the day',
    category: 'health' as const,
    frequency: 'daily' as const,
    color: '#06B6D4',
    icon: '💧',
    reminderTime: '09:00'
  },
  {
    name: 'Read for 20 Minutes',
    description: 'Daily reading to expand knowledge',
    category: 'learning' as const,
    frequency: 'daily' as const,
    color: '#8B5CF6',
    icon: '📚',
    reminderTime: '20:00'
  },
  {
    name: 'Meditation',
    description: '10 minutes of mindfulness practice',
    category: 'mindfulness' as const,
    frequency: 'daily' as const,
    color: '#10B981',
    icon: '🧘',
    reminderTime: '08:00'
  },
  {
    name: 'Healthy Meal',
    description: 'Eat a nutritious, balanced meal',
    category: 'health' as const,
    frequency: 'daily' as const,
    color: '#84CC16',
    icon: '🥗',
    reminderTime: '12:00'
  },
  {
    name: 'Journal',
    description: 'Write down thoughts and reflections',
    category: 'mindfulness' as const,
    frequency: 'daily' as const,
    color: '#F59E0B',
    icon: '📝',
    reminderTime: '21:00'
  }
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  habit,
  mode
}) => {
  const { createHabit, updateHabit, isLoading } = useHabits();
  const [showTemplates, setShowTemplates] = useState(mode === 'create' && !habit);
  
  const [formData, setFormData] = useState<HabitFormData>({
    name: habit?.name || '',
    description: habit?.description || '',
    category: habit?.category || 'other',
    frequency: habit?.frequency || 'daily',
    color: habit?.color || colors[0],
    icon: habit?.icon || icons[0],
    reminderEnabled: habit?.reminderEnabled || false,
    reminderTime: habit?.reminderTime || '09:00'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTemplateSelect = (template: typeof habitTemplates[0]) => {
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      frequency: template.frequency,
      color: template.color,
      icon: template.icon,
      reminderEnabled: true,
      reminderTime: template.reminderTime
    });
    setShowTemplates(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required';
    }
    if (formData.name.length > 100) {
      newErrors.name = 'Habit name must be less than 100 characters';
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Submitting habit data:', formData);
      if (mode === 'create') {
        const result = await createHabit(formData);
        console.log('Habit created successfully:', result);
      } else if (habit) {
        const result = await updateHabit(habit.id, formData);
        console.log('Habit updated successfully:', result);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving habit:', error);
      setErrors({ submit: `Failed to save habit: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'other',
      frequency: 'daily',
      color: colors[0],
      icon: icons[0],
      reminderEnabled: false,
      reminderTime: '09:00'
    });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Create New Habit' : 'Edit Habit'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection */}
        {mode === 'create' && (
          <div>
            {showTemplates ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Choose a Template (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(false)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Start from scratch
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                  {habitTemplates.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="flex items-start gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow"
                        style={{ backgroundColor: template.color }}
                      >
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                          {template.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowTemplates(true)}
                className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                ✨ Browse habit templates
              </button>
            )}
          </div>
        )}

        {/* Habit Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Habit Name *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Morning Exercise"
            error={errors.name}
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description of your habit..."
            rows={3}
            error={errors.description}
            maxLength={500}
          />
        </div>

        {/* Category and Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as HabitFormData['category'] })}
              options={categories}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <Select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as HabitFormData['frequency'] })}
              options={frequencies}
            />
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.color === color 
                    ? 'border-gray-900 dark:border-white scale-110' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Icon
          </label>
          <div className="flex gap-2 flex-wrap">
            {icons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({ ...formData, icon })}
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                  formData.icon === icon 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="reminderEnabled"
              checked={formData.reminderEnabled}
              onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="reminderEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable daily reminder
            </label>
          </div>
          {formData.reminderEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reminder Time
              </label>
              <Input
                type="time"
                value={formData.reminderTime}
                onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Habit' : 'Update Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};