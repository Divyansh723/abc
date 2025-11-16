import React from 'react';
import { Heart, TrendingUp, AlertTriangle, Calendar, RefreshCw, Sparkles } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { MoodHabitCorrelation as MoodHabitCorrelationType } from '@/services/aiService';

interface MoodHabitCorrelationProps {
  correlation: MoodHabitCorrelationType | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const MoodHabitCorrelation: React.FC<MoodHabitCorrelationProps> = ({
  correlation,
  isLoading,
  onRefresh
}) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'text-green-600 dark:text-green-400';
      case 'moderate':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'weak':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😔';
      case 'neutral':
        return '😐';
      default:
        return '🤔';
    }
  };

  if (isLoading && !correlation) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </Card>
        <div className="text-center py-8">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <p>AI is analyzing mood-habit correlations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!correlation) {
    return (
      <Card className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Insufficient mood data
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Track your mood for at least 2 weeks to see how your habits affect your wellbeing.
          </p>
          <Button onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Mood-Habit Analysis
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Discover how your habits impact your emotional wellbeing
              </p>
            </div>
          </div>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            {isLoading ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </div>
      </Card>

      {/* Habit Correlations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Habit Impact on Mood
          </h3>
          <Badge variant="outline">
            {correlation.correlations.length} habits analyzed
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {correlation.correlations.map((corr, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="text-3xl">
                  {getImpactIcon(corr.moodImpact)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {corr.habitName}
                    </h4>
                    <Badge className={getImpactColor(corr.moodImpact)}>
                      {corr.moodImpact}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {corr.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-500">Correlation strength:</span>
                    <span className={getStrengthColor(corr.strength)}>
                      {corr.strength}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mood Patterns */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Weekly Mood Patterns
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-green-700 dark:text-green-300 mb-3">
              Best Mood Days
            </h4>
            <div className="space-y-2">
              {correlation.moodPatterns.bestMoodDays.map((day, _index) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{day}</span>
                  <Badge 
                    variant="outline" 
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    High
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-red-700 dark:text-red-300 mb-3">
              Challenging Days
            </h4>
            <div className="space-y-2">
              {correlation.moodPatterns.challengingDays.map((day, _index) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{day}</span>
                  <Badge 
                    variant="outline" 
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    Low
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
              Overall Trend
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {correlation.moodPatterns.moodTrends}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          Key Insights
        </h3>
        
        <div className="space-y-3">
          {correlation.insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600 dark:text-purple-400">
                {index + 1}
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          AI Recommendations
        </h3>
        
        <div className="space-y-4">
          {correlation.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  Recommendation {index + 1}
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};