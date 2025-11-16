import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, Target, Sparkles, MessageCircle, BarChart3, Heart } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { useAI } from '@/hooks/useAI';
import { useAIPermissions } from '@/hooks/useAIPermissions';
import { cn } from '@/utils/cn';
import ErrorBoundary from '@/components/ErrorBoundary';

// AI Components
import { 
  AIInsightsOverview,
  HabitSuggestions,
  PatternAnalysis,
  MotivationalCoach,
  MoodHabitCorrelation,
  PersonalizedRecommendations,
  AIDisabledMessage
} from '@/components/ai';

type ViewType = 'overview' | 'patterns' | 'suggestions' | 'coaching' | 'mood' | 'recommendations';

const InsightsPage: React.FC = () => {
  const {
    insights,
    suggestions,
    motivationalContent,
    moodCorrelation,
    isLoading,
    error,
    fetchHabitInsights,
    fetchHabitSuggestions,
    fetchMotivationalContent,
    fetchMoodHabitCorrelation,
    clearError
  } = useAI();

  const permissions = useAIPermissions();
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initialize data on component mount (only if AI is enabled)
  useEffect(() => {
    const initializeData = async () => {
      if (!permissions.isAIEnabled) {
        setIsInitialLoad(false);
        return;
      }

      try {
        await Promise.all([
          fetchHabitInsights(),
          fetchMotivationalContent('insights'),
        ]);
      } catch (error) {
        console.error('Failed to initialize AI insights:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    initializeData();
  }, [fetchHabitInsights, fetchMotivationalContent]);

  // Load additional data based on active view
  useEffect(() => {
    const loadViewData = async () => {
      try {
        switch (activeView) {
          case 'suggestions':
            if (suggestions.length === 0) {
              await fetchHabitSuggestions();
            }
            break;
          case 'mood':
            if (!moodCorrelation) {
              await fetchMoodHabitCorrelation();
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to load ${activeView} data:`, error);
      }
    };

    if (!isInitialLoad) {
      loadViewData();
    }
  }, [activeView, isInitialLoad, suggestions.length, moodCorrelation, fetchHabitSuggestions, fetchMoodHabitCorrelation]);

  const viewTabs = [
    { 
      id: 'overview', 
      label: 'AI Overview', 
      icon: Brain,
      description: 'Comprehensive habit insights powered by AI'
    },
    { 
      id: 'patterns', 
      label: 'Pattern Analysis', 
      icon: BarChart3,
      description: 'Deep dive into your habit patterns'
    },
    { 
      id: 'suggestions', 
      label: 'Smart Suggestions', 
      icon: Lightbulb,
      description: 'AI-powered habit recommendations'
    },
    { 
      id: 'coaching', 
      label: 'AI Coach', 
      icon: MessageCircle,
      description: 'Personalized coaching and motivation'
    },
    { 
      id: 'mood', 
      label: 'Mood Analysis', 
      icon: Heart,
      description: 'How habits affect your wellbeing'
    },
    { 
      id: 'recommendations', 
      label: 'Optimization', 
      icon: Target,
      description: 'Personalized improvement recommendations'
    }
  ];

  const getInsightScore = () => {
    if (!insights) return 0;
    return insights.overallProgress.score;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-indigo-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  // Show AI disabled message if user has opted out
  if (!permissions.isAIEnabled) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              AI Insights
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Personalized insights powered by artificial intelligence
            </p>
          </div>
          <AIDisabledMessage />
        </div>
      </div>
    );
  }

  if (isInitialLoad && isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                <p>AI is analyzing your habits...</p>
              </div>
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
              <div className="relative">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              AI Insights
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Discover patterns, get personalized recommendations, and optimize your habit journey with AI
            </p>
          </div>

          <div className="flex flex-row items-center gap-3 sm:gap-4">
            {insights && (
              <div className="text-center flex-shrink-0">
                <div className={cn(
                  'text-xl sm:text-2xl font-bold mb-1',
                  getScoreColor(getInsightScore())
                )}>
                  {getInsightScore()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  AI Score
                </div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearError();
                fetchHabitInsights();
              }}
              disabled={isLoading}
              className="flex flex-row items-center gap-2 flex-1 sm:flex-initial justify-center whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span>{isLoading ? 'Analyzing...' : 'Refresh Insights'}</span>
            </Button>
          </div>
        </div>

        {/* AI Score Hero Card */}
        {insights && (
          <Card className={cn(
            'relative overflow-hidden bg-gradient-to-br text-white border-0 p-4 sm:p-5 md:p-6',
            getScoreBgColor(getInsightScore())
          )}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
            </div>

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                    AI Analysis Summary
                  </h2>
                  <p className="text-white/90 text-xs sm:text-sm">
                    {insights.overallProgress.summary}
                  </p>
                </div>
                
                <div className="text-center sm:text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                    {getInsightScore()}
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm">
                    Overall Score
                  </div>
                  <Badge 
                    variant="outline" 
                    className="mt-2 text-white border-white/30 bg-white/10"
                  >
                    {insights.overallProgress.trend}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                    {insights.keyInsights.length}
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm">
                    Key Insights
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                    {insights.habitRecommendations.length}
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm">
                    Recommendations
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                    {insights.nextSteps.length}
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm">
                    Action Items
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium">AI Analysis Error</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </Card>
        )}

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
                  title={tab.description}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <ErrorBoundary>
          {activeView === 'overview' && (
            <AIInsightsOverview 
              insights={insights}
              motivationalContent={motivationalContent}
              isLoading={isLoading}
            />
          )}

          {activeView === 'patterns' && (
            <PatternAnalysis />
          )}

          {activeView === 'suggestions' && (
            <HabitSuggestions 
              suggestions={suggestions}
              isLoading={isLoading}
              onRefresh={() => fetchHabitSuggestions()}
            />
          )}

          {activeView === 'coaching' && (
            <MotivationalCoach 
              motivationalContent={motivationalContent}
              isLoading={isLoading}
              onRefresh={() => fetchMotivationalContent('coaching')}
            />
          )}

          {activeView === 'mood' && (
            <MoodHabitCorrelation 
              correlation={moodCorrelation}
              isLoading={isLoading}
              onRefresh={() => fetchMoodHabitCorrelation()}
            />
          )}

          {activeView === 'recommendations' && (
            <PersonalizedRecommendations 
              insights={insights}
              isLoading={isLoading}
            />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default InsightsPage;