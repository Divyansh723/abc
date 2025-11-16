import React from 'react';
import { cn } from '@/utils/cn';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  children?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 'md',
  strokeWidth,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  children,
  className,
  animated = true,
}) => {
  const sizes = {
    sm: { diameter: 60, defaultStroke: 4, textSize: 'text-xs' },
    md: { diameter: 80, defaultStroke: 6, textSize: 'text-sm' },
    lg: { diameter: 120, defaultStroke: 8, textSize: 'text-base' },
    xl: { diameter: 160, defaultStroke: 10, textSize: 'text-lg' },
  };

  const { diameter, defaultStroke, textSize } = sizes[size];
  const stroke = strokeWidth || defaultStroke;
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={stroke}
          fill="transparent"
          className="dark:stroke-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-1000 ease-out',
            animated && 'animate-pulse'
          )}
          style={{
            transition: animated ? 'stroke-dashoffset 1s ease-out' : 'none',
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <div className={cn('font-bold text-gray-900 dark:text-white', textSize)}>
            {Math.round(progress)}%
          </div>
        ))}
      </div>
    </div>
  );
};