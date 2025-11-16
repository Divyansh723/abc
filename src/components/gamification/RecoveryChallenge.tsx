import React, { useState } from 'react';
import { RefreshCw, Target, Gift, Clock, CheckCircle } from 'lucide-react';
import { Button, Card, Modal, ModalContent, ModalFooter, Badge } from '@/components/ui';
import { generateRecoveryChallenge } from '@/utils/streakUtils';
import { cn } from '@/utils/cn';

interface RecoveryChallengeProps {
  habitId: string;
  habitName: string;
  daysMissed: number;
  onAccept: (challengeId: string) => Promise<void>;
  onDecline: () => void;
  isVisible: boolean;
  className?: string;
}

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  challenge: ReturnType<typeof generateRecoveryChallenge>;
  isLoading: boolean;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  challenge,
  isLoading,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recovery Challenge" size="md">
      <ModalContent>
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {challenge.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Don't let a missed day derail your progress! Take on this challenge to get back on track.
            </p>
          </div>

          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Challenge Goal
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {challenge.description}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Duration
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {challenge.duration} {challenge.duration === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Reward
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {challenge.reward}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-warning-700 dark:text-warning-300">
                <p className="font-medium mb-1">Challenge Rules:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Complete the challenge within the specified timeframe</li>
                  <li>• Track your progress daily</li>
                  <li>• Rewards are granted upon successful completion</li>
                  <li>• You can only have one active recovery challenge at a time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <Button variant="outline" onClick={onDecline} disabled={isLoading}>
          Maybe Later
        </Button>
        <Button 
          variant="primary" 
          onClick={onAccept} 
          loading={isLoading}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Accept Challenge
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export const RecoveryChallenge: React.FC<RecoveryChallengeProps> = ({
  habitId,
  habitName,
  daysMissed,
  onAccept,
  onDecline,
  isVisible,
  className,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const challenge = generateRecoveryChallenge(habitName, daysMissed);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await onAccept(`recovery-${habitId}-${Date.now()}`);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to accept recovery challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    setShowModal(false);
    onDecline();
  };

  if (!isVisible) return null;

  return (
    <>
      <Card className={cn(
        'relative overflow-hidden border-warning-200 dark:border-warning-800 bg-gradient-to-br from-warning-50 to-orange-50 dark:from-warning-900/20 dark:to-orange-900/20',
        className
      )}>
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-orange-500 rounded-full flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recovery Challenge
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get back on track with {habitName}
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="text-warning-600 border-warning-600">
              {daysMissed} {daysMissed === 1 ? 'day' : 'days'} missed
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            <p className="text-gray-700 dark:text-gray-300">
              {challenge.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {challenge.duration} {challenge.duration === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Gift className="h-4 w-4 text-success-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {challenge.reward}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowModal(true)}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              className="flex-1"
            >
              Accept Challenge
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDecline}
              className="flex-1"
            >
              Skip
            </Button>
          </div>
        </div>
      </Card>

      <ChallengeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAccept={handleAccept}
        onDecline={handleDecline}
        challenge={challenge}
        isLoading={isLoading}
      />
    </>
  );
};