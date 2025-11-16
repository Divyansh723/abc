import React, { useState } from 'react';
import { CheckCircle, Circle, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import { celebrationPresets } from '@/utils/confetti';

interface CompletionButtonProps {
  habitId: string;
  habitName: string;
  isCompleted: boolean;
  onComplete: (habitId: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  className?: string;
}

export const CompletionButton: React.FC<CompletionButtonProps> = ({
  habitId,
  habitName,
  isCompleted,
  onComplete,
  disabled = false,
  size = 'md',
  showAnimation = true,
  className,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled || isCompleted) return;

    if (showAnimation) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      
      // Trigger confetti celebration
      setTimeout(() => {
        celebrationPresets.habitComplete();
      }, 100);
    }

    onComplete(habitId);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative rounded-full border-2 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          sizeClasses[size],
          isCompleted
            ? 'bg-success-500 border-success-500 text-white shadow-lg'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:scale-105',
          disabled && 'opacity-50 cursor-not-allowed',
          isAnimating && 'animate-bounce-gentle',
          className
        )}
        aria-label={`${isCompleted ? 'Completed' : 'Mark as complete'}: ${habitName}`}
      >
        {isCompleted ? (
          <CheckCircle className={iconSizes[size]} />
        ) : (
          <Circle className={iconSizes[size]} />
        )}
      </button>

      {/* Success animation */}
      {isAnimating && showAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-success-500 rounded-full animate-ping opacity-75" />
          <Zap className="h-6 w-6 text-success-500 animate-bounce z-10" />
        </div>
      )}

      {/* XP notification */}
      {isAnimating && showAnimation && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-success-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-slide-up">
            +10 XP
          </div>
        </div>
      )}
    </div>
  );
};