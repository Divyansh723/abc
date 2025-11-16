import React, { useState } from 'react';
import { Heart, Brain, Activity, TrendingUp, Calendar, BarChart3, Flame, RefreshCw } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { MoodTracker, HabitImpactAnalysis } from '@/components/wellbeing';
import { ProgressRing } from '@/components/analytics';
import { useWellbeing } from '@/hooks/useWellbeing';
import { useHabits } from '@/hooks/useHabits';
import { cn } from '@/utils/cn';
import ErrorBoundary from '@/components/ErrorBoundary';

type ViewType = 'overview' | 'mood' | 'analysis';

const WellbeingPage: React.FC = () => {
  const {
    wellbeingScore,
    fetchWellbeingScore,
    fetchMoodEntries,
    fetchHabitImpacts,
    isLoading
  } = useWellbeing();
  const { habits } = useHabits();
  const [activeView, setActiveView] = useState<ViewType>('overview');

  // Use real data or fallback to defaults
  const wellbeingData = wellbeingScore || {
    overall: 0,
    mood: 0,
    energy: 0,
    stress: 0,
    weeklyChange: 0,
    habitCorrelation: 0
  };

  const viewTabs = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'mood', label: 'Mood Tracking', icon: Activity },
    { id: 'analysis', label: 'Habit Impact', icon: BarChart3 }
  ];



  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-indigo-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  if (isLoading && !wellbeingScore) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading wellbeing data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
              Wellbeing Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Track how your habits impact your mental health and overall wellness
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Badge
              variant="outline"
              size="sm"
              className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            >
              Wellbeing Score: {wellbeingData.overall}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchWellbeingScore();
                fetchMoodEntries();
                fetchHabitImpacts();
              }}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 min-w-max">
            {viewTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as ViewType)}
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
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Wellbeing Score Hero */}
            <Card className={cn(
              'relative overflow-hidden bg-gradient-to-br text-white border-0 p-4 sm:p-6 md:p-8',
              getScoreBgColor(wellbeingData.overall)
            )}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
              </div>

              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      Your Wellbeing Score
                    </h2>
                    <p className="text-sm sm:text-base text-white/80">
                      Based on mood, energy, stress levels, and habit consistency
                    </p>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                      {wellbeingData.overall}
                    </div>
                    <div className="text-white/80 text-xs sm:text-sm">
                      out of 100
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-6">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                      +{wellbeingData.weeklyChange}
                    </div>
                    <div className="text-white/80 text-xs sm:text-sm">
                      This Week
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                      {wellbeingData.mood.toFixed(1)}
                    </div>
                    <div className="text-white/80 text-xs sm:text-sm">
                      Avg Mood
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                      {Math.round(wellbeingData.habitCorrelation * 100)}%
                    </div>
                    <div className="text-white/80 text-xs sm:text-sm">
                      Habit Impact
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="text-center p-4 sm:p-6">
                <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
                  <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    Mood Trends
                  </span>
                </div>
                <div className="mb-4">
                  <ProgressRing
                    progress={(wellbeingData.mood / 5) * 100}
                    size="md"
                    color="#EC4899"
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {wellbeingData.mood.toFixed(1)}/5.0 average this month
                </div>
              </Card>

              <Card className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Activity className="h-6 w-6 text-yellow-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Energy Levels
                  </span>
                </div>
                <div className="mb-4">
                  <ProgressRing
                    progress={(wellbeingData.energy / 5) * 100}
                    size="md"
                    color="#F59E0B"
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {wellbeingData.energy.toFixed(1)}/5.0 average energy
                </div>
              </Card>

              <Card className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Brain className="h-6 w-6 text-purple-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Stress Management
                  </span>
                </div>
                <div className="mb-4">
                  <ProgressRing
                    progress={((5 - wellbeingData.stress) / 5) * 100}
                    size="md"
                    color="#8B5CF6"
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {wellbeingData.stress.toFixed(1)}/5.0 stress level
                </div>
              </Card>
            </div>

            {/* Quick Insights and Habit Streaks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Positive Patterns
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Mood improves by 25% during habit streaks
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Consistent habits boost wellbeing by {Math.round(wellbeingData.habitCorrelation * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Morning routines correlate with better daily mood
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  This Week's Highlights
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Best mood day
                    </span>
                    <Badge variant="outline" size="sm">
                      Tuesday
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Highest energy
                    </span>
                    <Badge variant="outline" size="sm">
                      Monday
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Most productive
                    </span>
                    <Badge variant="outline" size="sm">
                      Wednesday
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Active Streaks
                </h3>
                <div className="space-y-3">
                  {habits.filter(h => h.currentStreak > 0).slice(0, 3).map((habit) => {
                    return (
                      <div key={habit.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: habit.color }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {habit.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-orange-500">
                          <Flame className="h-3 w-3" />
                          <span className="text-sm font-medium">
                            {habit.currentStreak}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {habits.filter(h => h.currentStreak > 0).length === 0 && (
                    <div className="text-center py-4">
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Start building streaks to see them here
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Mood Tracking Tab */}
        {activeView === 'mood' && (
          <ErrorBoundary>
            <MoodTracker />
          </ErrorBoundary>
        )}



        {/* Habit Impact Analysis Tab */}
        {activeView === 'analysis' && (
          <HabitImpactAnalysis />
        )}
      </div>
    </div>
  );
};

export default WellbeingPage;