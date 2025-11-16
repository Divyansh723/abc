import React, { useEffect, useState } from 'react';
import { Trophy, Star, Gift, Zap, Crown } from 'lucide-react';
import { Button, Modal, ModalContent, Badge } from '@/components/ui';
import { 
  getLevelTitle, 
  getLevelColor,
  type LevelUpResult 
} from '@/utils/xpUtils';
import { cn } from '@/utils/cn';
import { celebrationPresets } from '@/utils/confetti';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelUpData: LevelUpResult;
  onClaim?: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  levelUpData,
  onClaim,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);

  const levelTitle = getLevelTitle(levelUpData.newLevel);
  const levelColors = getLevelColor(levelUpData.newLevel);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setCurrentRewardIndex(0);
      
      // Trigger confetti celebration
      setTimeout(() => {
        celebrationPresets.levelUp();
      }, 100);
      
      // Auto-advance through rewards
      const interval = setInterval(() => {
        setCurrentRewardIndex(prev => {
          if (prev < levelUpData.rewards.length - 1) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isOpen, levelUpData.rewards.length]);

  const handleClaim = () => {
    onClaim?.();
    onClose();
  };

  const getLevelIcon = (level: number) => {
    if (level >= 50) return Crown;
    if (level >= 20) return Star;
    return Zap;
  };

  const Icon = getLevelIcon(levelUpData.newLevel);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      <ModalContent>
        <div className="text-center space-y-6 py-4">
          {/* Confetti Animation */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'absolute w-2 h-2 animate-bounce',
                    i % 4 === 0 && 'bg-yellow-400',
                    i % 4 === 1 && 'bg-blue-400',
                    i % 4 === 2 && 'bg-green-400',
                    i % 4 === 3 && 'bg-pink-400'
                  )}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Main celebration content */}
          <div className="relative z-10">
            {/* Level up icon */}
            <div className="flex justify-center mb-6">
              <div 
                className={cn(
                  'w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl animate-bounce-gentle bg-gradient-to-r',
                  levelColors.gradient
                )}
              >
                <Icon className="h-12 w-12" />
              </div>
            </div>

            {/* Level up text */}
            <div className="space-y-2 mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Level Up! 🎉
              </h2>
              <div className="text-xl font-semibold" style={{ color: levelColors.primary }}>
                Level {levelUpData.newLevel}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {levelTitle}
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                {levelUpData.celebrationMessage}
              </p>
            </div>

            {/* XP gained */}
            <div className="mb-6">
              <div
                style={{ 
                  borderColor: levelColors.primary, 
                  color: levelColors.primary,
                  backgroundColor: `${levelColors.primary}10`
                }}
              >
                <Badge 
                  variant="outline" 
                  className="text-lg px-4 py-2 font-bold"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {levelUpData.newTotalXP} Total XP
                </Badge>
              </div>
            </div>

            {/* Rewards section */}
            {levelUpData.rewards.length > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Gift className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Rewards Unlocked!
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
                  {levelUpData.rewards.map((reward, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all duration-500 transform',
                        index <= currentRewardIndex 
                          ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 scale-100 opacity-100' 
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 scale-95 opacity-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {reward.includes('Badge') && '🏆'}
                          {reward.includes('Theme') && '🎨'}
                          {reward.includes('Color') && '🌈'}
                          {reward.includes('Booster') && '🔥'}
                          {!reward.includes('Badge') && !reward.includes('Theme') && !reward.includes('Color') && !reward.includes('Booster') && '🎁'}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {reward}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Multiple levels gained */}
            {levelUpData.levelsGained && levelUpData.levelsGained > 1 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-purple-700 dark:text-purple-300">
                    Incredible Achievement!
                  </span>
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  You gained {levelUpData.levelsGained} levels in one go! Your dedication is truly inspiring!
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleClaim}
                className="px-8"
                style={{ 
                  backgroundColor: levelColors.primary,
                  borderColor: levelColors.primary
                }}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Claim Rewards
              </Button>
            </div>

            {/* Motivational message */}
            <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                "Success is the sum of small efforts repeated day in and day out. Keep building those habits!"
              </p>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};