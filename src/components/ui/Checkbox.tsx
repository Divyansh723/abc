import React, { forwardRef, useId } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  error,
  indeterminate = false,
  className,
  id,
  ...props
}, ref) => {
  const generatedId = useId();
  const checkboxId = id || generatedId;
  const errorId = `${checkboxId}-error`;

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'h-4 w-4 rounded border-gray-300 dark:border-gray-600',
              'text-primary-600 focus:ring-primary-500 focus:ring-offset-0',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-error-500 focus:ring-error-500',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
          
          {/* Custom checkbox indicator */}
          <div className={cn(
            'absolute inset-0 flex items-center justify-center pointer-events-none',
            'text-white transition-opacity duration-200',
            (props.checked || indeterminate) ? 'opacity-100' : 'opacity-0'
          )}>
            {indeterminate ? (
              <Minus className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </div>
        </div>
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label 
                htmlFor={checkboxId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-error-600 dark:text-error-400 ml-7">
          {error}
        </p>
      )}
    </div>
  );
});