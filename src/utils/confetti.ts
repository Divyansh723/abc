import confetti from 'canvas-confetti';

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  scalar?: number;
}

export const triggerConfetti = (options: ConfettiOptions = {}) => {
  const defaults: ConfettiOptions = {
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
  };

  return confetti({
    ...defaults,
    ...options,
  });
};

// Celebration presets
export const celebrationPresets = {
  // Habit completion - gentle celebration
  habitComplete: () => {
    triggerConfetti({
      particleCount: 50,
      spread: 45,
      startVelocity: 25,
      colors: ['#10b981', '#34d399', '#6ee7b7'],
      origin: { x: 0.5, y: 0.7 },
    });
  },

  // Level up - big celebration
  levelUp: () => {
    // First burst
    triggerConfetti({
      particleCount: 100,
      spread: 70,
      startVelocity: 30,
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'],
      origin: { x: 0.5, y: 0.6 },
    });

    // Second burst with delay
    setTimeout(() => {
      triggerConfetti({
        particleCount: 50,
        spread: 60,
        startVelocity: 25,
        colors: ['#6366f1', '#8b5cf6', '#a855f7'],
        origin: { x: 0.5, y: 0.7 },
      });
    }, 250);
  },

  // Challenge completion - epic celebration
  challengeComplete: () => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
    
    // Center burst
    triggerConfetti({
      particleCount: 150,
      spread: 80,
      startVelocity: 35,
      colors,
      origin: { x: 0.5, y: 0.6 },
    });

    // Left burst
    setTimeout(() => {
      triggerConfetti({
        particleCount: 75,
        spread: 60,
        startVelocity: 30,
        colors,
        origin: { x: 0.2, y: 0.7 },
      });
    }, 150);

    // Right burst
    setTimeout(() => {
      triggerConfetti({
        particleCount: 75,
        spread: 60,
        startVelocity: 30,
        colors,
        origin: { x: 0.8, y: 0.7 },
      });
    }, 300);
  },

  // Streak milestone - special celebration
  streakMilestone: (streakDays: number) => {
    const intensity = Math.min(streakDays / 10, 3);
    const particleCount = Math.floor(50 + (intensity * 25));
    
    triggerConfetti({
      particleCount,
      spread: 50 + (intensity * 10),
      startVelocity: 20 + (intensity * 5),
      colors: ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed'],
      origin: { x: 0.5, y: 0.6 },
    });

    // Extra burst for major milestones
    if (streakDays % 30 === 0) {
      setTimeout(() => {
        triggerConfetti({
          particleCount: 100,
          spread: 90,
          startVelocity: 40,
          colors: ['#fbbf24', '#f59e0b'],
          origin: { x: 0.5, y: 0.5 },
        });
      }, 200);
    }
  },

  // Achievement unlock
  achievementUnlock: () => {
    triggerConfetti({
      particleCount: 80,
      spread: 55,
      startVelocity: 28,
      colors: ['#8b5cf6', '#a855f7', '#c084fc', '#e879f9'],
      origin: { x: 0.5, y: 0.65 },
    });
  },
};

// Cleanup function
export const stopAllConfetti = () => {
  confetti.reset();
};
