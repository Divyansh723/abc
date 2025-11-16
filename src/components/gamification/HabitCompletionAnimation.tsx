import React, { useEffect, useState } from 'react';
import { Check, Sparkles, Star } from 'lucide-react';
import { celebrationPresets } from '@/utils/confetti';
import { cn } from '@/utils/cn';

interface HabitCompletionAnimationProps {
  show: boolean;
  xpEarned: number;
  streakDays?: number;
  onComplete?: () => void;
}

export const HabitCompletionAnimation: React.FC<HabitCompletionAnimationProps> = ({
  show,
  xpEarned,
  streakDays = 0,
  onComplete,
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (show) {
      // Trigger confetti
      setTimeout(() => {
        celebrationPresets.habitComplete();
      }, 100);

      // Animation sequence
      const phases = [
        { delay: 0, phase: 1 },
        { delay: 300, phase: 2 },
        { delay: 600, phase: 3 },
      ];

      phases.forEach(({ delay, phase }) => {
        setTimeout(() => setAnimationPhase(phase), delay);
      });

      // Auto-hide after animation
      const hideTimer = setTimeout(() => {
        onComplete?.();
      }, 2000);

      return () => {
        clearTimeout(hideTimer);
        setAnimationPhase(0);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative">
        {/* Main check icon */}
        <div
          className={cn(
            'w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl transition-all duration-500',
            animationPhase >= 1 ? 'scale-100 opacity-100 animate-pop-in' : 'scale-0 opacity-0'
          )}
        >
          <Check className="h-16 w-16 text-white" strokeWidth={3} />
        </div>

        {/* Sparkle effects */}
        {animationPhase >= 2 && (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${50 + Math.cos((i * Math.PI) / 4) * 80}px`,
                  top: `${50 + Math.sin((i * Math.PI) / 4) * 80}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </div>
            ))}
          </>
        )}

        {/* XP badge */}
        {animationPhase >= 3 && (
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 animate-slide-in-up">
            <div className="bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg border-2 border-green-400">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-bold text-green-600 dark:text-green-400">
                  +{xpEarned} XP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Streak indicator */}
        {streakDays > 0 && animationPhase >= 3 && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 animate-slide-in-up">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full px-6 py-2 shadow-lg">
              <span className="font-bold text-white text-sm">
                🔥 {streakDays} Day Streak!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
