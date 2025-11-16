import React from 'react';
import { ChallengeHistory } from '@/services/challengeService';
import challengeService from '@/services/challengeService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Calendar, Zap, Award, RotateCcw, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChallengeHistoryCardProps {
  history: ChallengeHistory;
  onViewDetails?: () => void;
  className?: string;
}

export const ChallengeHistoryCard: React.FC<ChallengeHistoryCardProps> = ({
  history,
  onViewDetails,
  className
}) => {
  const { challenge, completedCount, abandonedCount, totalXpEarned, bestTime, lastAttempt } = history;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const totalAttempts = completedCount + abandonedCount;
  const successRate = totalAttempts > 0 ? Math.round((completedCount / totalAttempts) * 100) : 0;
  
  return (
    <Card 
      className={cn(
        'p-6 hover:shadow-lg transition-all cursor-pointer',
        className
      )}
      onClick={onViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{challenge.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {challenge.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={challengeService.getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty}
              </Badge>
              {completedCount > 0 && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Trophy className="w-3 h-3 mr-1" />
                  {completedCount}x
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Total XP Earned */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              Total XP
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {totalXpEarned}
          </div>
        </div>

        {/* Best Time */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Best Time
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {bestTime ? `${bestTime}d` : 'N/A'}
          </div>
        </div>

        {/* Completions */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <RotateCcw className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              Completed
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completedCount}
          </div>
        </div>

        {/* Abandoned */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Abandoned
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {abandonedCount}
          </div>
        </div>
      </div>

      {/* Success Rate Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Success Rate
          </span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            {successRate}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500 rounded-full',
              successRate >= 75 ? 'bg-green-500' :
              successRate >= 50 ? 'bg-yellow-500' :
              successRate >= 25 ? 'bg-orange-500' :
              'bg-red-500'
            )}
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Last Attempt */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Calendar className="w-3 h-3" />
        <span>Last attempt: {formatDate(lastAttempt)}</span>
      </div>
    </Card>
  );
};

export default ChallengeHistoryCard;
