import React, { useEffect, useState } from 'react';
import { Trophy, Target, Star, Zap, Award, Crown } from 'lucide-react';
import { Modal, ModalContent, Button } from '@/components/ui';
import { celebrationPresets } from '@/utils/confetti';
import { cn } from '@/utils/cn';

interface ChallengeCompletionAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  challengeName: string;
  challengeType: 'personal' | 'community';
  xpEarned: number;
  completionTime?: number;
  participantCount?: number;
  rank?: number;
}

export const ChallengeCompletionAnimation: React.FC<ChallengeCompletionAnimationProps> = ({
  isOpen,
  onClose,
  challengeName,
  challengeType,
  xpEarned,
  completionTime,
  participantCount,
  rank,
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Epic confetti celebration
      setTimeout(() => {
        celebrationPresets.challengeComplete();
      }, 100);

      // Animation sequence
      const phases = [
        { delay: 0, phase: 1 },
        { delay: 400, phase: 2 },
        { delay: 800, phase: 3 },
        { delay: 1200, phase: 4 },
      ];

      phases.forEach(({ delay, phase }) => {
        setTimeout(() => setAnimationPhase(phase), delay);
      });
    } else {
      setAnimationPhase(0);
    }
  }, [isOpen]);

  const getRankIcon = () => {
    if (!rank) return Trophy;
    if (rank === 1) return Crown;
    if (rank === 2) return Award;
    if (rank === 3) return Star;
    return Trophy;
  };

  const getRankTitle = () => {
    if (!rank) return 'Challenge Complete!';
    if (rank === 1) return '🥇 First Place!';
    if (rank === 2) return '🥈 Second Place!';
    if (rank === 3) return '🥉 Third Place!';
    return `#${rank} Finisher!`;
  };

  const getRankMessage = () => {
    if (challengeType === 'personal') {
      return `Congratulations! You've successfully completed "${challengeName}"${completionTime ? ` in ${completionTime} days` : ''}!`;
    }
    if (!rank || !participantCount) {
      return `Amazing work completing "${challengeName}"! Your dedication paid off.`;
    }
    if (rank === 1) {
      return `Outstanding! You finished first out of ${participantCount} participants in "${challengeName}"!`;
    } else if (rank <= 3) {
      return `Excellent performance! You placed ${rank === 2 ? 'second' : 'third'} out of ${participantCount} participants!`;
    } else {
      return `Great job! You finished #${rank} out of ${participantCount} participants in "${challengeName}"!`;
    }
  };

  const getBonusXP = () => {
    if (!rank) return 0;
    if (rank === 1) return Math.floor(xpEarned * 0.5);
    if (rank === 2) return Math.floor(xpEarned * 0.3);
    if (rank === 3) return Math.floor(xpEarned * 0.2);
    return 0;
  };

  const totalXP = xpEarned + getBonusXP();
  const RankIcon = getRankIcon();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-lg">
          {/* Animated background particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'absolute rounded-full animate-float opacity-20',
                  i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-pink-400'
                )}
                style={{
                  width: `${8 + (i % 4) * 4}px`,
                  height: `${8 + (i % 4) * 4}px`,
                  left: `${5 + (i * 6)}%`,
                  top: `${10 + (i % 5) * 15}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${3 + i * 0.1}s`,
                }}
              />
            ))}
          </div>

          <div className="relative text-center p-8 space-y-6">
            {/* Main icon */}
            <div
              className={cn(
                'flex justify-center transition-all duration-700',
                animationPhase >= 1 ? 'scale-100 opacity-100 animate-rotate-in' : 'scale-0 opacity-0'
              )}
            >
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                  <RankIcon className="h-16 w-16 text-white" />
                </div>
                {/* Rotating ring effect */}
                <div className="absolute inset-0 rounded-full border-4 border-blue-400 opacity-30 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            {/* Title */}
            <div
              className={cn(
                'transition-all duration-500',
                animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              )}
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                {getRankTitle()}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {getRankMessage()}
              </p>
            </div>

            {/* Stats display */}
            <div
              className={cn(
                'grid gap-4 transition-all duration-500',
                challengeType === 'community' && rank ? 'grid-cols-3' : 'grid-cols-2',
                animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              )}
            >
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Challenge</span>
                </div>
                <div className="text-xl font-bold text-blue-600 capitalize">{challengeType}</div>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">XP Earned</span>
                </div>
                <div className="text-xl font-bold text-green-600">+{totalXP}</div>
              </div>

              {challengeType === 'community' && rank && (
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Trophy className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rank</span>
                  </div>
                  <div className="text-xl font-bold text-purple-600">#{rank}</div>
                </div>
              )}
            </div>

            {/* Bonus XP indicator */}
            {getBonusXP() > 0 && (
              <div
                className={cn(
                  'p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 transition-all duration-500',
                  animationPhase >= 3 ? 'translate-y-0 opacity-100 animate-pulse-glow' : 'translate-y-4 opacity-0'
                )}
              >
                <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                  🎉 Ranking Bonus!
                </h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  You earned an extra {getBonusXP()} XP for your excellent ranking!
                </p>
              </div>
            )}

            {/* Action button */}
            <div
              className={cn(
                'transition-all duration-500',
                animationPhase >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              )}
            >
              <Button
                onClick={onClose}
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Awesome!
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
