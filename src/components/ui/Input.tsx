import React, { forwardRef, useId } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  className,
  type = 'text',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperTextId = `${inputId}-helper`;
  
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type;
  
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon || showPasswordToggle || !!error;
  
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {hasLeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-4 w-4 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={cn(
            'input-field',
            hasLeftIcon && 'pl-10',
            hasRightIcon && 'pr-10',
            error && 'border-error-500 focus:ring-error-500 focus:border-error-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            helperText && !error && helperTextId
          )}
          {...props}
        />
        
        {hasRightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {error && (
              <AlertCircle className="h-4 w-4 text-error-500" />
            )}
            {showPasswordToggle && !error && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            {rightIcon && !error && !showPasswordToggle && (
              <div className="h-4 w-4 text-gray-400 dark:text-gray-500">
                {rightIcon}
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperTextId} className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});