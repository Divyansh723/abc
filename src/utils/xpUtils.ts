export interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number;
  progressPercentage: number;
  progressToNextLevel?: number;
}

export interface LevelUpResult {
  newLevel: number;
  xpGained: number;
  rewards: string[];
  celebrationMessage?: string;
  newTotalXP?: number;
  levelsGained?: number;
}

export const XP_PER_LEVEL = 100;
export const XP_MULTIPLIER = 1.2; // 20% increase per level

// Helper function to round to nearest multiple of 10
const roundToNearestTen = (value: number): number => {
  return Math.round(value / 10) * 10;
};

export function calculateLevelInfo(totalXP: number): LevelInfo {
  // Progressive XP system: each level requires 20% more XP than previous
  // Level 1→2: 100 XP
  // Level 2→3: 120 XP
  // Level 3→4: 140 XP (144 rounded to 140)
  // Level 4→5: 170 XP (172.8 rounded to 170), etc.
  
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = XP_PER_LEVEL;
  let accumulatedXP = 0;
  
  // Calculate level by accumulating XP requirements
  while (totalXP >= accumulatedXP + xpForNextLevel) {
    accumulatedXP += xpForNextLevel;
    level++;
    xpForCurrentLevel = accumulatedXP;
    xpForNextLevel = roundToNearestTen(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
  }
  
  const xpProgress = totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel;
  const progressPercentage = (xpProgress / xpNeeded) * 100;
  
  return {
    currentLevel: level,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel: xpForCurrentLevel + xpForNextLevel,
    xpProgress,
    progressPercentage,
    progressToNextLevel: Math.round(progressPercentage)
  };
}

export function calculateLevelUp(oldXP: number, newXP: number): LevelUpResult | null {
  const oldLevel = calculateLevelInfo(oldXP).currentLevel;
  const newLevel = calculateLevelInfo(newXP).currentLevel;
  
  if (newLevel > oldLevel) {
    const rewards = [];
    const levelsGained = newLevel - oldLevel;
    
    // Add rewards based on level milestones
    if (newLevel % 5 === 0) {
      rewards.push('Special Badge');
    }
    if (newLevel % 10 === 0) {
      rewards.push('Forgiveness Token');
    }
    
    return {
      newLevel,
      xpGained: newXP - oldXP,
      rewards,
      celebrationMessage: `Congratulations! You've reached Level ${newLevel}!`,
      newTotalXP: newXP,
      levelsGained
    };
  }
  
  return null;
}

export interface XPCalculation {
  baseXP: number;
  streakBonus: number;
  multiplierBonus: number;
  totalXP: number;
  reason: string;
}

export function getXPForHabitCompletion(streakLength: number): number {
  const baseXP = 10;
  const streakBonus = Math.min(streakLength * 2, 50); // Max 50 bonus XP
  return baseXP + streakBonus;
}

export function calculateHabitCompletionXP(
  baseXP: number,
  streakLength: number,
  multiplier: number = 1,
  reason: string = 'Habit completion'
): XPCalculation {
  const streakBonus = Math.min(streakLength * 2, 50);
  const multiplierBonus = Math.floor((baseXP + streakBonus) * (multiplier - 1));
  const totalXP = baseXP + streakBonus + multiplierBonus;
  
  return {
    baseXP,
    streakBonus,
    multiplierBonus,
    totalXP,
    reason
  };
}

export function processLevelUp(oldXP: number, newXP: number): LevelUpResult | null {
  return calculateLevelUp(oldXP, newXP);
}

export function getLevelTitle(level: number): string {
  if (level >= 100) return 'Grandmaster';
  if (level >= 75) return 'Master';
  if (level >= 50) return 'Expert';
  if (level >= 25) return 'Advanced';
  if (level >= 10) return 'Intermediate';
  if (level >= 5) return 'Novice';
  return 'Beginner';
}

export function getLevelColor(level: number): { bg: string; text: string; border: string; gradient: string; primary: string; secondary: string } {
  if (level >= 100) return { 
    bg: 'bg-purple-500', 
    text: 'text-white', 
    border: 'border-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    primary: '#8B5CF6',
    secondary: '#7C3AED'
  };
  if (level >= 75) return { 
    bg: 'bg-yellow-500', 
    text: 'text-white', 
    border: 'border-yellow-500',
    gradient: 'from-yellow-500 to-yellow-600',
    primary: '#F59E0B',
    secondary: '#D97706'
  };
  if (level >= 50) return { 
    bg: 'bg-red-500', 
    text: 'text-white', 
    border: 'border-red-500',
    gradient: 'from-red-500 to-red-600',
    primary: '#EF4444',
    secondary: '#DC2626'
  };
  if (level >= 25) return { 
    bg: 'bg-blue-500', 
    text: 'text-white', 
    border: 'border-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    primary: '#3B82F6',
    secondary: '#2563EB'
  };
  if (level >= 10) return { 
    bg: 'bg-green-500', 
    text: 'text-white', 
    border: 'border-green-500',
    gradient: 'from-green-500 to-green-600',
    primary: '#10B981',
    secondary: '#059669'
  };
  if (level >= 5) return { 
    bg: 'bg-orange-500', 
    text: 'text-white', 
    border: 'border-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    primary: '#F97316',
    secondary: '#EA580C'
  };
  return { 
    bg: 'bg-gray-500', 
    text: 'text-white', 
    border: 'border-gray-500',
    gradient: 'from-gray-500 to-gray-600',
    primary: '#6B7280',
    secondary: '#4B5563'
  };
}

export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
}

export function getNextMilestone(level: number): { level: number; title: string } {
  const milestones = [5, 10, 25, 50, 75, 100];
  const nextMilestone = milestones.find(m => m > level) || level + 25;
  return {
    level: nextMilestone,
    title: getLevelTitle(nextMilestone)
  };
}