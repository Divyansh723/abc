# Celebration Animations

This document describes the celebration animations implemented in HabitForge for habit completion, level up, and challenge completion events.

## Overview

The celebration system uses the `canvas-confetti` library to create engaging visual feedback when users achieve milestones. Three main types of celebrations are implemented:

1. **Habit Completion** - Gentle celebration when a habit is marked complete
2. **Level Up** - Big celebration when user gains a new level
3. **Challenge Completion** - Epic celebration when a challenge is completed

## Components

### 1. Confetti Utility (`src/utils/confetti.ts`)

Core utility that provides confetti animation presets.

**Available Presets:**

```typescript
import { celebrationPresets } from '@/utils/confetti';

// Habit completion - gentle green confetti
celebrationPresets.habitComplete();

// Level up - double burst with gold and purple
celebrationPresets.levelUp();

// Challenge completion - triple burst from multiple positions
celebrationPresets.challengeComplete();

// Streak milestone - scales with streak length
celebrationPresets.streakMilestone(streakDays);

// Achievement unlock - purple confetti
celebrationPresets.achievementUnlock();
```

### 2. HabitCompletionAnimation

A full-screen overlay animation that appears when a habit is completed.

**Usage:**

```typescript
import { HabitCompletionAnimation } from '@/components/gamification';

<HabitCompletionAnimation
  show={showAnimation}
  xpEarned={10}
  streakDays={5}
  onComplete={() => setShowAnimation(false)}
/>
```

**Props:**
- `show` (boolean) - Controls visibility
- `xpEarned` (number) - XP amount to display
- `streakDays` (number, optional) - Current streak to display
- `onComplete` (function, optional) - Callback when animation completes

**Features:**
- Animated check icon with pop-in effect
- Floating sparkles around the icon
- XP badge that slides up
- Streak indicator for active streaks
- Auto-dismisses after 2 seconds

### 3. ChallengeCompletionAnimation

A modal-based celebration for challenge completions with ranking support.

**Usage:**

```typescript
import { ChallengeCompletionAnimation } from '@/components/gamification';

<ChallengeCompletionAnimation
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  challengeName="30-Day Meditation"
  challengeType="community"
  xpEarned={500}
  completionTime={30}
  participantCount={150}
  rank={3}
/>
```

**Props:**
- `isOpen` (boolean) - Controls modal visibility
- `onClose` (function) - Close handler
- `challengeName` (string) - Name of the challenge
- `challengeType` ('personal' | 'community') - Type of challenge
- `xpEarned` (number) - Base XP earned
- `completionTime` (number, optional) - Days taken to complete
- `participantCount` (number, optional) - Total participants
- `rank` (number, optional) - User's ranking (1-3 get special treatment)

**Features:**
- Animated background particles
- Rotating icon with rank-based selection
- Stats display grid
- Bonus XP calculation for top 3 ranks
- Multi-phase animation sequence
- Epic confetti celebration

### 4. Enhanced CelebrationModal

The existing level-up modal now includes confetti animations.

**Features:**
- Automatic confetti trigger on open
- Animated reward reveals
- Level-based icon and color theming
- Multiple level gain support

## Integration Examples

### Habit Completion Button

The `CompletionButton` component automatically triggers confetti:

```typescript
import { CompletionButton } from '@/components/habit';

<CompletionButton
  habitId={habit.id}
  habitName={habit.name}
  isCompleted={habit.isCompleted}
  onComplete={handleComplete}
  showAnimation={true}
/>
```

### Level Up Detection

Trigger the celebration modal when XP changes result in a level up:

```typescript
import { CelebrationModal } from '@/components/gamification';

// In your component
const handleXPGain = (xp: number) => {
  const result = addXP(xp);
  
  if (result.leveledUp) {
    setLevelUpData(result);
    setShowCelebration(true);
  }
};

<CelebrationModal
  isOpen={showCelebration}
  onClose={() => setShowCelebration(false)}
  levelUpData={levelUpData}
/>
```

### Challenge Completion

Show the challenge completion animation when a challenge is finished:

```typescript
import { ChallengeCompletionAnimation } from '@/components/gamification';

const handleChallengeComplete = (challenge) => {
  setChallengeData({
    name: challenge.name,
    type: challenge.type,
    xp: challenge.xpReward,
    rank: challenge.userRank,
    participants: challenge.totalParticipants,
  });
  setShowChallengeModal(true);
};

<ChallengeCompletionAnimation
  isOpen={showChallengeModal}
  onClose={() => setShowChallengeModal(false)}
  {...challengeData}
/>
```

## Customization

### Custom Confetti

You can create custom confetti effects using the base `triggerConfetti` function:

```typescript
import { triggerConfetti } from '@/utils/confetti';

triggerConfetti({
  particleCount: 100,
  spread: 70,
  startVelocity: 30,
  colors: ['#ff0000', '#00ff00', '#0000ff'],
  origin: { x: 0.5, y: 0.6 },
});
```

### Animation Timing

All animations use CSS keyframes defined in `src/index.css`:

- `animate-pop-in` - Scale and bounce effect
- `animate-slide-in-up` - Slide from bottom
- `animate-rotate-in` - Rotate and scale in
- `animate-float` - Gentle floating motion
- `animate-pulse-glow` - Pulsing glow effect

## Performance Considerations

- Confetti animations are lightweight and GPU-accelerated
- Animations auto-cleanup after completion
- Modal-based celebrations prevent multiple simultaneous displays
- Confetti particle counts are optimized for performance

## Browser Support

The celebration system works in all modern browsers that support:
- CSS animations
- Canvas API
- ES6+ JavaScript

## Future Enhancements

Potential improvements:
- Sound effects for celebrations
- Haptic feedback on mobile devices
- Customizable confetti colors based on user theme
- Achievement-specific celebration animations
- Social sharing integration for major milestones
