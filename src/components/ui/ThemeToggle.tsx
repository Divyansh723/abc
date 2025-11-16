import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './Button';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  position?: 'header' | 'settings' | 'floating';
  variant?: 'button' | 'dropdown';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  showLabel = false,
  position: _position = 'header',
  variant = 'button',
}) => {
  const { theme, setTheme, toggleTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const Icon = currentTheme.icon;

  if (variant === 'dropdown') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Theme
        </label>
        <div className="grid grid-cols-2 gap-2">
          {themes.map((themeOption) => {
            const ThemeIcon = themeOption.icon;
            const isActive = theme === themeOption.value;
            
            return (
              <Button
                key={themeOption.value}
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTheme(themeOption.value)}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <ThemeIcon className="h-4 w-4" />
                <span className="text-xs">{themeOption.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className="flex items-center gap-2 transition-transform duration-200 hover:scale-105"
      title={`Current theme: ${currentTheme.label}. Click to toggle theme.`}
    >
      <Icon className="h-4 w-4 transition-transform duration-300" />
      {showLabel && <span>{currentTheme.label}</span>}
    </Button>
  );
};