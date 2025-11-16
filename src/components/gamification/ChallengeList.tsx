import React, { useState } from 'react';
import { Trophy, Search, Plus } from 'lucide-react';
import { Button, Input, Select, Card } from '@/components/ui';
import { Challenge } from './Challenge';
import { type Challenge as ChallengeType, type ChallengeParticipation } from '@/types/gamification';
import { cn } from '@/utils/cn';

interface ChallengeListProps {
  challenges: ChallengeType[];
  participations: ChallengeParticipation[];
  onJoinChallenge: (challengeId: string) => Promise<any>;
  onLeaveChallenge: (challengeId: string) => Promise<any>;
  isLoading?: boolean;
  showCreateButton?: boolean;
  onCreateChallenge?: () => void;
  className?: string;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Challenges' },
  { value: 'available', label: 'Available to Join' },
  { value: 'participating', label: 'My Challenges' },
  { value: 'completed', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'duration', label: 'Duration' },
  { value: 'reward', label: 'Highest Reward' },
  { value: 'participants', label: 'Most Popular' },
];

export const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  participations,
  onJoinChallenge,
  onLeaveChallenge,
  isLoading = false,
  showCreateButton = false,
  onCreateChallenge,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Create a map of participations for quick lookup
  const participationMap = new Map(
    participations.map(p => [p.challengeId, p])
  );

  // Filter and sort challenges
  const filteredChallenges = challenges
    .filter(challenge => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!challenge.name.toLowerCase().includes(query) &&
            !challenge.description.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      const participation = participationMap.get(challenge.id);
      switch (filterBy) {
        case 'available':
          return !participation && challenge.active;
        case 'participating':
          return participation && !participation.completed;
        case 'completed':
          return participation?.completed;
        default:
          return challenge.active;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'duration':
          return a.duration - b.duration;
        case 'reward':
          return b.rewardXP - a.rewardXP;
        case 'participants':
          return b.participants.length - a.participants.length;
        default: // newest
          return new Date(b.id).getTime() - new Date(a.id).getTime();
      }
    });

  const getStats = () => {
    const total = challenges.length;
    const participating = participations.filter(p => !p.completed).length;
    const completed = participations.filter(p => p.completed).length;
    const available = challenges.filter(c => !participationMap.has(c.id) && c.active).length;

    return { total, participating, completed, available };
  };

  const stats = getStats();

  if (challenges.length === 0) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Challenges Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Check back later for new challenges to test your habit-building skills!
        </p>
        {showCreateButton && onCreateChallenge && (
          <Button
            variant="primary"
            onClick={onCreateChallenge}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Challenge
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Challenges
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test your skills and earn rewards
          </p>
        </div>

        {showCreateButton && onCreateChallenge && (
          <Button
            variant="primary"
            onClick={onCreateChallenge}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Challenge
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total
          </div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {stats.participating}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Active
          </div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-success-600 dark:text-success-400">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Completed
          </div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
            {stats.available}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Available
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            options={FILTER_OPTIONS}
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {/* Challenge Grid */}
      {filteredChallenges.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Challenges Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <Challenge
              key={challenge.id}
              challenge={challenge}
              participation={participationMap.get(challenge.id)}
              onJoin={onJoinChallenge}
              onLeave={onLeaveChallenge}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Load more button (if needed) */}
      {filteredChallenges.length > 0 && filteredChallenges.length < challenges.length && (
        <div className="text-center pt-6">
          <Button variant="outline">
            Load More Challenges
          </Button>
        </div>
      )}
    </div>
  );
};