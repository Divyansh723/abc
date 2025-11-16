import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui';
import { useAccentColorStore, type AccentColor, accentColorPalettes } from '@/stores/accentColorStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

interface AccentColorPickerProps {
  className?: string;
}

const colorInfo: Record<AccentColor, { name: string; description: string }> = {
  blue: { name: 'Ocean Blue', description: 'Classic and professional' },
  purple: { name: 'Royal Purple', description: 'Creative and inspiring' },
  green: { name: 'Forest Green', description: 'Natural and calming' },
  orange: { name: 'Sunset Orange', description: 'Energetic and warm' },
  pink: { name: 'Cherry Blossom', description: 'Playful and friendly' },
  red: { name: 'Ruby Red', description: 'Bold and passionate' },
  teal: { name: 'Tropical Teal', description: 'Fresh and modern' },
  indigo: { name: 'Deep Indigo', description: 'Sophisticated and elegant' },
};

export const AccentColorPicker: React.FC<AccentColorPickerProps> = ({ className }) => {
  const { accentColor, setAccentColor } = useAccentColorStore();
  const { updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const colors: AccentColor[] = ['blue', 'purple', 'green', 'orange', 'pink', 'red', 'teal', 'indigo'];

  const handleColorSelect = async (color: AccentColor) => {
    // Apply color immediately for instant feedback
    setAccentColor(color);
    
    // Save to database
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({ accentColor: color });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save accent color:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex items-center gap-2">
          <Check className="h-4 w-4 text-success-600 dark:text-success-400" />
          <p className="text-sm text-success-700 dark:text-success-300">
            Accent color saved successfully!
          </p>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Accent Color
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose your preferred accent color to personalize your experience
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {colors.map((color) => {
          const isSelected = accentColor === color;
          const palette = accentColorPalettes[color];
          const info = colorInfo[color];

          return (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              disabled={isSaving}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105',
                isSelected
                  ? 'border-gray-900 dark:border-white shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              style={{
                background: `linear-gradient(135deg, ${palette[400]} 0%, ${palette[600]} 100%)`,
              }}
            >
              {/* Color Preview */}
              <div className="aspect-square rounded-lg mb-3 flex items-center justify-center">
                {isSelected && (
                  <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="h-6 w-6 text-gray-900 dark:text-white" />
                  </div>
                )}
              </div>

              {/* Color Info */}
              <div className="text-center">
                <div className="font-semibold text-white text-sm mb-1">
                  {info.name}
                </div>
                <div className="text-xs text-white/80">
                  {info.description}
                </div>
              </div>

              {/* Selection Ring */}
              {isSelected && (
                <div className="absolute inset-0 rounded-xl ring-4 ring-offset-2 ring-gray-900 dark:ring-white ring-offset-white dark:ring-offset-gray-900 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Preview Section */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Preview
        </h4>
        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: accentColorPalettes[accentColor][600],
            }}
          >
            Primary Button
          </button>
          <button
            className="px-4 py-2 border-2 rounded-lg font-medium transition-colors"
            style={{
              borderColor: accentColorPalettes[accentColor][600],
              color: accentColorPalettes[accentColor][600],
            }}
          >
            Outline Button
          </button>
          <div
            className="px-4 py-2 rounded-lg font-medium"
            style={{
              backgroundColor: accentColorPalettes[accentColor][100],
              color: accentColorPalettes[accentColor][700],
            }}
          >
            Badge
          </div>
        </div>
      </div>
    </Card>
  );
};
