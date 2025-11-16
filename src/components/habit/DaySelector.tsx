import React from 'react';
import { cn } from '@/utils/cn';

interface DaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
  className?: string;
}

const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, onChange, className }) => {
  const days = [
    { value: 0, label: 'Sun', fullLabel: 'Sunday' },
    { value: 1, label: 'Mon', fullLabel: 'Monday' },
    { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
    { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
    { value: 4, label: 'Thu', fullLabel: 'Thursday' },
    { value: 5, label: 'Fri', fullLabel: 'Friday' },
    { value: 6, label: 'Sat', fullLabel: 'Saturday' }
  ];

  const toggleDay = (dayValue: number) => {
    const newSelectedDays = selectedDays.includes(dayValue)
      ? selectedDays.filter(d => d !== dayValue)
      : [...selectedDays, dayValue].sort();
    
    onChange(newSelectedDays);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Select days of the week
      </div>
      
      {/* Desktop/Tablet View - Horizontal */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {days.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                'border-2 min-w-[60px] flex items-center justify-center',
                'hover:scale-105 active:scale-95',
                isSelected
                  ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-400'
              )}
              title={day.fullLabel}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      {/* Mobile View - Grid */}
      <div className="grid grid-cols-4 gap-2 sm:hidden">
        {days.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                'px-2 py-3 rounded-lg text-xs font-medium transition-all duration-200',
                'border-2 flex flex-col items-center justify-center',
                'hover:scale-105 active:scale-95',
                isSelected
                  ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-400'
              )}
            >
              <span className="text-xs">{day.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {selectedDays.length === 0 && (
          <span className="text-red-500 dark:text-red-400">Please select at least one day</span>
        )}
        {selectedDays.length === 7 && (
          <span className="text-green-600 dark:text-green-400">Every day selected</span>
        )}
        {selectedDays.length > 0 && selectedDays.length < 7 && (
          <span>
            {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected: {' '}
            {selectedDays.map(d => days[d].label).join(', ')}
          </span>
        )}
      </div>
    </div>
  );
};

export default DaySelector;
