import React from 'react';
import { PersonalChallenge } from '@/services/challengeService';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Sparkles, RotateCcw, Calendar, TrendingUp } from 'lucide-react';

interface ChallengeCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: PersonalChallenge;
  xpAwarded: number;
  daysToComplete: number;
  finalScore: number;
  onJoinAgain?: () => void;
}

export const ChallengeCompletionModal: React.FC<ChallengeCompletionModalProps> = ({
  isOpen,
  onClose,
  challenge,
  xpAwarded,
  daysToComplete,
  finalScore,
  onJoinAgain
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center space-y-6">
        {/* Celebration Animation */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="text-8xl animate-bounce">
              {challenge.icon}
            </div>
          </div>
        </div>

        {/* Completion Message */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Challenge Complete!
            </h2>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {challenge.title}
          </p>
        </div>

        {/* XP Reward Display */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div className="text-5xl font-bold text-purple-600 dark:text-purple-400">
              +{xpAwarded}
            </div>
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
            XP Earned
          </p>
        </div>

        {/* Completion Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {daysToComplete}
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Days to Complete
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {finalScore}%
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Final Score
            </p>
          </div>
        </div>

        {/* Challenge Details */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              {challenge.difficulty}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {challenge.requirements.type === 'streak' && 'Streak Challenge'}
              {challenge.requirements.type === 'total_completions' && 'Completion Challenge'}
              {challenge.requirements.type === 'consistency' && 'Consistency Challenge'}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {challenge.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {onJoinAgain && (
            <Button
              onClick={() => {
                onJoinAgain();
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Join Again
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="outline"
            className={onJoinAgain ? '' : 'flex-1'}
          >
            Close
          </Button>
        </div>

        {/* Motivational Message */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            "Success is the sum of small efforts repeated day in and day out."
          </p>
        </div>
      </div>
    </Modal>
  );
};

// Export only as named export for consistency
// export default ChallengeCompletionModal;
