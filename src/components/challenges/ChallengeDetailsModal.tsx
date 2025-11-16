import React, { useState, useEffect } from 'react';
import { PersonalChallenge } from '@/services/challengeService';
import challengeService from '@/services/challengeService';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChallengeProgressBar } from './ChallengeProgressBar';
import { 
  Trophy, 
  Clock, 
  Target, 
  Flame, 
  CheckCircle, 
  Play,
  X,
  AlertTriangle,
  RotateCcw,
  Award
} from 'lucide-react';

interface ChallengeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  onJoin?: (challengeId: string) => Promise<boolean>;
  onAbandon?: (participationId: string) => Promise<boolean>;
}

export const ChallengeDetailsModal: React.FC<ChallengeDetailsModalProps> = ({
  isOpen,
  onClose,
  challengeId,
  onJoin,
  onAbandon
}) => {
  const [challenge, setChallenge] = useState<PersonalChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  
  useEffect(() => {
    if (isOpen && challengeId) {
      loadChallengeDetails();
    }
  }, [isOpen, challengeId]);
  
  const loadChallengeDetails = async () => {
    setLoading(true);
    try {
      const data = await challengeService.getChallengeById(challengeId);
      setChallenge(data);
    } catch (error) {
      console.error('Error loading challenge details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoin = async () => {
    if (!onJoin || !challenge) return;
    
    setActionLoading(true);
    try {
      const success = await onJoin(challenge._id);
      if (success) {
        await loadChallengeDetails();
      }
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleAbandon = async () => {
    if (!onAbandon || !challenge?.userHistory?.activeParticipation) return;
    
    setActionLoading(true);
    try {
      const success = await onAbandon(challenge.userHistory.activeParticipation._id);
      if (success) {
        setShowAbandonConfirm(false);
        await loadChallengeDetails();
      }
    } finally {
      setActionLoading(false);
    }
  };
  
  const getTypeIcon = () => {
    if (!challenge) return null;
    
    switch (challenge.requirements.type) {
      case 'streak':
        return <Flame className="w-6 h-6" />;
      case 'total_completions':
        return <Target className="w-6 h-6" />;
      case 'consistency':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Trophy className="w-6 h-6" />;
    }
  };
  
  const getRequirementDescription = () => {
    if (!challenge) return '';
    
    const { type, target, habitCategories } = challenge.requirements;
    const categoryText = habitCategories.length > 0 
      ? ` in ${habitCategories.join(', ')} habits`
      : ' across all habits';
    
    switch (type) {
      case 'streak':
        return `Maintain a ${target}-day streak${categoryText}`;
      case 'total_completions':
        return `Complete ${target} habits${categoryText}`;
      case 'consistency':
        return `Achieve ${target}% consistency${categoryText}`;
      default:
        return '';
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : challenge ? (
          <>
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="text-5xl">{challenge.icon}</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {challenge.title}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={challengeService.getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  {challenge.userHistory?.activeParticipation && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </Badge>
                  )}
                  {challenge.userHistory && challenge.userHistory.completedCount > 0 && (
                    <Badge variant="outline">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Completed {challenge.userHistory.completedCount}x
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                {challenge.description}
              </p>
            </div>
            
            {/* Requirements */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {getTypeIcon()}
                Challenge Requirements
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Target className="w-4 h-4" />
                  <span>{getRequirementDescription()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>Duration: {challengeService.formatDuration(challenge.duration)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Trophy className="w-4 h-4" />
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    Reward: {challenge.xpReward} XP
                  </span>
                </div>
              </div>
            </div>
            
            {/* Active Participation Progress */}
            {challenge.userHistory?.activeParticipation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Your Progress
                </h3>
                <ChallengeProgressBar
                  current={challenge.userHistory.activeParticipation.progress.current}
                  target={challenge.userHistory.activeParticipation.progress.target}
                  percentage={challenge.userHistory.activeParticipation.progress.percentage}
                  startDate={challenge.userHistory.activeParticipation.startDate}
                  duration={challenge.duration}
                />
              </div>
            )}
            
            {/* History Stats */}
            {challenge.userHistory && (challenge.userHistory.completedCount > 0 || challenge.userHistory.bestTime) && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Your History
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Completions</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {challenge.userHistory.completedCount}
                    </div>
                  </div>
                  {challenge.userHistory.bestTime && (
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Best Time</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {challenge.userHistory.bestTime} days
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Total XP Earned</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {challenge.userHistory.totalXpEarned}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Abandon Confirmation */}
            {showAbandonConfirm && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                      Abandon Challenge?
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      Your progress will be lost and you won't receive any XP. You can rejoin this challenge later.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAbandon}
                        disabled={actionLoading}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                      >
                        {actionLoading ? 'Abandoning...' : 'Yes, Abandon'}
                      </Button>
                      <Button
                        onClick={() => setShowAbandonConfirm(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {!challenge.userHistory?.activeParticipation && onJoin && (
                <Button
                  onClick={handleJoin}
                  disabled={actionLoading}
                  className="flex-1"
                  variant="primary"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {actionLoading ? 'Joining...' : 'Start Challenge'}
                </Button>
              )}
              
              {challenge.userHistory?.activeParticipation && onAbandon && !showAbandonConfirm && (
                <Button
                  onClick={() => setShowAbandonConfirm(true)}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Abandon Challenge
                </Button>
              )}
              
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Failed to load challenge details
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ChallengeDetailsModal;
