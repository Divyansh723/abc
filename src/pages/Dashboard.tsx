import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { DailyHabitChecklist } from '@/components/habit';
import { XPBar, LevelBadge } from '@/components/gamification';
import { ProgressRing } from '@/components/analytics';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';
import { useGamification } from '@/hooks/useGamification';
import { useAI } from '@/hooks/useAI';
import { habitService } from '@/services/habitService';
import { Target, BarChart3, Trophy, Heart, RefreshCw, Brain, Sparkles, TrendingUp, Zap, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getTotalStats, fetchHabits } = useHabits();
  const { totalXP, forgivenessTokens } = useGamification();
  const { motivationalContent, fetchMotivationalContent } = useAI();
  const stats = getTotalStats();

  const handleRecalculateStats = async () => {
    try {
      const result = await habitService.recalculateHabitStats();
      console.log('Recalculated stats for', result.habitsUpdated, 'habits');
      // Refresh habits to get updated data
      await fetchHabits();
      alert(`Successfully recalculated statistics for ${result.habitsUpdated} habits!`);
    } catch (error) {
      console.error('Failed to recalculate stats:', error);
      alert('Failed to recalculate statistics. Please try again.');
    }
  };

  // Fetch AI motivation on component mount
  React.useEffect(() => {
    fetchMotivationalContent('dashboard');
  }, [fetchMotivationalContent]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalEmoji = () => {
    const rate = stats.completionRate;
    if (rate === 100) return '🎉';
    if (rate >= 80) return '🔥';
    if (rate >= 60) return '💪';
    if (rate >= 40) return '🌟';
    return '🚀';
  };

  return (
    <div className="p-4 sm:p-6 overflow-x-hidden min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Welcome Header with Enhanced Design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-grid-pattern"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 overflow-hidden">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words mb-2 animate-slide-in-left">
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
                </h1>
                <p className="text-sm sm:text-base text-white/90 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                  {stats.completionRate === 100 
                    ? "Perfect day! You've completed all your habits! 🎉"
                    : stats.completionRate >= 80
                    ? "You're crushing it today! Keep going! 🔥"
                    : stats.completionRate >= 50
                    ? "Great progress! You're halfway there! 💪"
                    : stats.totalHabits > 0
                    ? "Let's make today count! Start with one habit 🚀"
                    : "Ready to build some great habits today?"}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 animate-slide-in-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecalculateStats}
                  className="flex items-center gap-2 text-xs sm:text-sm bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Fix Streaks</span>
                  <span className="xs:hidden">Fix</span>
                </Button>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
                  <LevelBadge totalXP={totalXP} variant="compact" showProgress />
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            {stats.totalHabits > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-medium">Today</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.completedToday}/{stats.totalHabits}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-medium">Streaks</span>
                  </div>
                  <div className="text-2xl font-bold">🔥 {stats.currentStreaks}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-medium">Rate</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.completionRate}%</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-medium">Tokens</span>
                  </div>
                  <div className="text-2xl font-bold">{forgivenessTokens}/3</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Daily Habits - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2 min-w-0 space-y-6">
            <DailyHabitChecklist showStreaks />
          </div>

          {/* Sidebar with Quick Info */}
          <div className="space-y-4 sm:space-y-6 min-w-0">
            {/* XP Progress with Enhanced Design */}
            <div className="animate-scale-in">
              <XPBar totalXP={totalXP} showDetails animated />
            </div>

            {/* Today's Progress with Enhanced Design */}
            <Card className="animate-scale-in bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 [animation-delay:0.1s]">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm",
                  stats.completionRate >= 80 
                    ? "bg-success-100 dark:bg-success-900" 
                    : stats.completionRate >= 60 
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-orange-100 dark:bg-orange-900"
                )}>
                  <Target className={cn(
                    "h-5 w-5",
                    stats.completionRate >= 80 
                      ? "text-success-600 dark:text-success-400" 
                      : stats.completionRate >= 60 
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-orange-600 dark:text-orange-400"
                  )} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Today's Progress
                </h2>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <ProgressRing
                    progress={stats.completionRate}
                    size="lg"
                    color={stats.completionRate >= 80 ? '#10B981' : stats.completionRate >= 60 ? '#3B82F6' : '#F59E0B'}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-1">{getMotivationalEmoji()}</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.completedToday}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        of {stats.totalHabits}
                      </div>
                    </div>
                  </ProgressRing>
                  {stats.completionRate === 100 && stats.totalHabits > 0 && (
                    <div className="absolute -top-2 -right-2 animate-bounce">
                      <div className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg">
                        ⭐
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Streaks</span>
                  <span className="font-bold text-lg text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    🔥 {stats.currentStreaks || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Forgiveness Tokens</span>
                  <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                    {forgivenessTokens}/3
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Streak</span>
                  <span className="font-bold text-lg text-yellow-600 dark:text-yellow-400">
                    {stats.longestStreak} days
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions with Enhanced Design */}
            <Card className="animate-scale-in [animation-delay:0.2s]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
              
              <div className="space-y-2">
                <Link 
                  to="/analytics"
                  className="group w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      View Analytics
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Check your progress trends
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </Link>
                
                <Link 
                  to="/goals"
                  className="group w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200 hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Join Challenge
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Compete with the community
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
                </Link>
                
                <Link 
                  to="/wellbeing"
                  className="group w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200 hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Wellbeing Check
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Track your mood & wellness
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </Card>

            {/* AI Motivational Content with Enhanced Design */}
            <Card className="animate-scale-in bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800 relative overflow-hidden [animation-delay:0.3s]">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </div>
                {motivationalContent ? (
                  <>
                    <blockquote className="text-base font-medium text-gray-800 dark:text-gray-200 italic mb-4 px-2">
                      "{motivationalContent.message}"
                    </blockquote>
                    {motivationalContent.quote && (
                      <cite className="text-sm text-gray-600 dark:text-gray-400 block mb-3">
                        {motivationalContent.quote}
                      </cite>
                    )}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                      <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        AI-powered daily motivation
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <blockquote className="text-base font-medium text-gray-800 dark:text-gray-200 italic mb-3 px-2">
                      "Success is the sum of small efforts repeated day in and day out."
                    </blockquote>
                    <cite className="text-sm text-gray-600 dark:text-gray-400">
                      — Robert Collier
                    </cite>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;