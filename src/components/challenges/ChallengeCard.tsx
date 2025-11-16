import React, { useState } from 'react';
import { PersonalChallenge } from '@/services/challengeService';
import challengeService from '@/services/challengeService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { 
  Trophy, 
  Clock, 
  Target, 
  Flame, 
  CheckCircle, 
  Play,
  RotateCcw,
  Info
} from 'lucide-react';

interface ChallengeCardProps {
  challenge: PersonalChallenge;
  onJoin?: (challengeId: string) => Promise<boolean>;
  onViewDetails?: (challenge: PersonalChallenge) => void;
  className?: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onJoin,
  onViewDetails,
  className
}) => {
  const [isJoining, setIsJoining] = useState(false);
  
  const { userStatus } = challenge;
  const isActive = userStatus?.isActive || false;
  const completedCount = userStatus?.completedCount || 0;
  
  const handleJoin = async () => {
    if (!onJoin) return;
    
    setIsJoining(true);
    try {
      await onJoin(challenge._id);
    } finally {
      setIsJoining(false);
    }
  };
  
  const getTypeIcon = () => {
    switch (challenge.requirements.type) {
      case 'streak':
        return <Flame className="w-5 h-5" />;
      case 'total_completions':
        return <Target className="w-5 h-5" />;
      case 'consistency':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };
  
  return (
    <Card className={cn('p-6 hover:shadow-lg transition-shadow', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{challenge.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {challenge.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={challengeService.getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty}
              </Badge>
              {completedCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {completedCount}x
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {isActive && (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Active
          </Badge>
        )}
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {challenge.description}
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          {getTypeIcon()}
          <span>{challengeService.getTypeDisplayName(challenge.requirements.type)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Target className="w-5 h-5" />
          <span>Goal: {challenge.requirements.target}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Clock className="w-5 h-5" />
          <span>Duration: {challengeService.formatDuration(challenge.duration)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Trophy className="w-5 h-5" />
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {challenge.xpReward} XP
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        {!isActive && onJoin && (
          <Button
            onClick={handleJoin}
            disabled={isJoining}
            className="flex-1"
            variant="primary"
          >
            <Play className="w-4 h-4 mr-2" />
            {isJoining ? 'Joining...' : 'Start Challenge'}
          </Button>
        )}
        
        {onViewDetails && (
          <Button
            onClick={() => onViewDetails(challenge)}
            variant="outline"
            className={isActive ? 'flex-1' : ''}
          >
            <Info className="w-4 h-4 mr-2" />
            Details
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ChallengeCard;
