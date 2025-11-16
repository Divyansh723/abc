import React, { useState } from 'react';
import { Plus, Target, Search, Star, Flame } from 'lucide-react';
import { Card, Button, Badge, Input, Select } from '@/components/ui';
import { HabitForm, HabitCard } from '@/components/habit';
import { AchievementGrid, ForgivenessToken } from '@/components/gamification';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { ChallengeDetailsModal } from '@/components/challenges/ChallengeDetailsModal';
import { ChallengeProgressBar } from '@/components/challenges/ChallengeProgressBar';
import { useHabits } from '@/hooks/useHabits';
import { useGamification } from '@/hooks/useGamification';
import { useChallenges } from '@/hooks/useChallenges';
import { useForgivenessTokens } from '@/hooks/useForgivenessTokens';
import { PersonalChallenge } from '@/services/challengeService';

import { cn } from '@/utils/cn';
import type { Habit } from '@/types/habit';

type TabType = 'habits' | 'challenges' | 'achievements';
type HabitFilter = 'all' | 'active' | 'paused' | 'completed';

const GoalsPage: React.FC = () => {
  const { habits, createHabit, updateHabit, deleteHabit } = useHabits();
  const { 
    achievements, 
    achievementsLoading
  } = useGamification();
  
  const {
    challenges: personalChallenges,
    challengesLoading: personalChallengesLoading,
    activeParticipations,
    joinChallenge: joinPersonalChallenge,
    abandonChallenge,
    activeChallengeCount,
    joinError,
    clearJoinError
  } = useChallenges();

  const { tokens, useToken } = useForgivenessTokens();

  const [activeTab, setActiveTab] = useState<TabType>('habits');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitFilter, setHabitFilter] = useState<HabitFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<PersonalChallenge | null>(null);
  const [showChallengeDetails, setShowChallengeDetails] = useState(false);
  const [personalChallengeFilter, setPersonalChallengeFilter] = useState<'all' | 'active' | 'available'>('all');

  // Filter habits based on current filter and search
  const filteredHabits = habits.filter(habit => {
    const matchesFilter = habitFilter === 'all' ||
      (habitFilter === 'active' && habit.active) ||
      (habitFilter === 'paused' && !habit.active) ||
      (habitFilter === 'completed' && habit.archived);

    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCreateHabit = async (habitData: any) => {
    try {
      console.log('GoalsPage: Creating habit with data:', habitData);
      const result = await createHabit(habitData);
      console.log('GoalsPage: Habit created successfully:', result);
      setShowHabitForm(false);
    } catch (error) {
      console.error('GoalsPage: Failed to create habit:', error);
    }
  };

  const handleEditHabit = async (habitData: any) => {
    if (editingHabit) {
      try {
        await updateHabit(editingHabit.id, habitData);
        setEditingHabit(null);
        setShowHabitForm(false);
      } catch (error) {
        console.error('Failed to update habit:', error);
      }
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      console.log('GoalsPage: Deleting habit with ID:', habitId);
      await deleteHabit(habitId);
      console.log('GoalsPage: Habit deleted successfully');
    } catch (error) {
      console.error('GoalsPage: Failed to delete habit:', error);
    }
  };

  const tabs = [
    { id: 'habits', label: 'My Habits', icon: Target, count: habits.length },
    { id: 'challenges', label: 'Challenges', icon: Flame, count: activeChallengeCount },
    { id: 'achievements', label: 'Achievements', icon: Star, count: achievements.filter((a: any) => a.unlocked).length }
  ];

  const habitFilterOptions = [
    { value: 'all', label: 'All Habits' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' }
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <Target className="h-6 w-6 sm:h-8 sm:w-8" />
              Goals & Challenges
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Manage your habits, join challenges, and track achievements
            </p>
          </div>

          {activeTab === 'habits' && (
            <Button
              onClick={() => {
                setEditingHabit(null);
                setShowHabitForm(true);
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Create Habit
            </Button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    'flex items-center gap-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count > 0 && (
                    <Badge variant="secondary" size="sm">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'habits' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search habits..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={habitFilter}
                  onChange={(e) => setHabitFilter(e.target.value as HabitFilter)}
                  options={habitFilterOptions}
                />
              </div>
            </div>

            {/* Habits Grid */}
            {filteredHabits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onEdit={(habit: Habit) => {
                      setEditingHabit(habit);
                      setShowHabitForm(true);
                    }}
                    onDelete={() => handleDeleteHabit(habit.id)}
                    showActions
                    variant="detailed"
                    showStreakAnimation
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-8 sm:py-12 px-4">
                <div className="max-w-md mx-auto">
                  <Target className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery || habitFilter !== 'all' ? 'No habits found' : 'No habits yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery || habitFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first habit to start building better routines.'
                    }
                  </p>
                  {(!searchQuery && habitFilter === 'all') && (
                    <Button
                      onClick={() => {
                        setEditingHabit(null);
                        setShowHabitForm(true);
                      }}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Habit
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            {habits.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                    {habits.filter((h: Habit) => h.active).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Active Habits
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-success-600 dark:text-success-400 mb-1">
                    {Math.round(habits.reduce((acc: number, h: Habit) => acc + h.consistencyRate, 0) / habits.length)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Average Consistency
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning-600 dark:text-warning-400 mb-1">
                    {Math.max(...habits.map((h: Habit) => h.longestStreak), 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Longest Streak
                  </div>
                </Card>
              </div>
            )}

            {/* Forgiveness Tokens */}
            {habits.length > 0 && (
              <ForgivenessToken
                available={tokens}
                onUse={useToken}
              />
            )}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Active Challenges Summary */}
            {activeParticipations.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Active Challenges ({activeParticipations.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {activeParticipations.map((participation: any) => {
                    const challenge = participation.challengeId as PersonalChallenge;
                    return (
                      <Card key={participation._id} className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-4xl">{challenge.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {challenge.title}
                            </h3>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Active
                            </Badge>
                          </div>
                        </div>
                        <ChallengeProgressBar
                          current={participation.progress.current}
                          target={participation.progress.target}
                          percentage={participation.progress.percentage}
                          startDate={participation.startDate}
                          duration={challenge.duration}
                        />
                        <div className="mt-4">
                          <Button
                            onClick={() => {
                              setSelectedChallenge(challenge);
                              setShowChallengeDetails(true);
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            View Details
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {personalChallengeFilter === 'active' ? 'Active Challenges' : 
                   personalChallengeFilter === 'available' ? 'Available Challenges' : 
                   'All Challenges'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete personal challenges to earn XP and build consistency
                </p>
              </div>
              <div className="w-48">
                <Select
                  value={personalChallengeFilter}
                  onChange={(e) => setPersonalChallengeFilter(e.target.value as 'all' | 'active' | 'available')}
                  options={[
                    { value: 'all', label: 'All Challenges' },
                    { value: 'active', label: 'Active' },
                    { value: 'available', label: 'Available' }
                  ]}
                />
              </div>
            </div>

            {/* Join Error Message */}
            {joinError && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Unable to Join Challenge
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                      {joinError}
                    </p>
                  </div>
                  <button
                    onClick={clearJoinError}
                    className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </Card>
            )}

            {/* Challenges Grid */}
            {personalChallengesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading challenges...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalChallenges
                  .filter(challenge => {
                    if (personalChallengeFilter === 'active') {
                      return challenge.userStatus?.isActive;
                    }
                    if (personalChallengeFilter === 'available') {
                      return !challenge.userStatus?.isActive;
                    }
                    return true;
                  })
                  .map((challenge: PersonalChallenge) => (
                    <ChallengeCard
                      key={challenge._id}
                      challenge={challenge}
                      onJoin={joinPersonalChallenge}
                      onViewDetails={(selectedChallenge: PersonalChallenge) => {
                        setSelectedChallenge(selectedChallenge);
                        setShowChallengeDetails(true);
                      }}
                    />
                  ))}
              </div>
            )}

            {personalChallenges.length === 0 && !personalChallengesLoading && (
              <Card className="text-center py-12">
                <Flame className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No challenges available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back later for new challenges to join
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Achievements
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Unlock badges and milestones as you build consistent habits
                </p>
              </div>
            </div>

            {achievementsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading achievements...</p>
                </div>
              </div>
            ) : (
              <AchievementGrid 
                achievements={achievements}
                unlockedAchievements={achievements.filter((a: any) => a.unlockedAt).map((a: any) => a.id)}
              />
            )}
          </div>
        )}

        {/* Habit Form Modal */}
        {showHabitForm && (
          <HabitForm
            isOpen={showHabitForm}
            habit={editingHabit}
            onSubmit={editingHabit ? handleEditHabit : handleCreateHabit}
            onClose={() => {
              setShowHabitForm(false);
              setEditingHabit(null);
            }}
          />
        )}

        {/* Challenge Details Modal */}
        {showChallengeDetails && selectedChallenge && (
          <ChallengeDetailsModal
            isOpen={showChallengeDetails}
            onClose={() => {
              setShowChallengeDetails(false);
              setSelectedChallenge(null);
            }}
            challengeId={selectedChallenge._id}
            onJoin={joinPersonalChallenge}
            onAbandon={abandonChallenge}
          />
        )}
      </div>
    </div>
  );
};

export default GoalsPage;