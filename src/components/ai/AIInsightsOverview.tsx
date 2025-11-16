import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { AIInsights, MotivationalContent } from '@/services/aiService';

interface AIInsightsOverviewProps {
  insights: AIInsights | null;
  motivationalContent: MotivationalContent | null;
  isLoading: boolean;
}

export const AIInsightsOverview: React.FC<AIInsightsOverviewProps> = ({
  insights,
  motivationalContent,
  isLoading
}) => {
  if (isLoading && !insights) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <Card className="text-center py-12">
        <div className="max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No insights available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete a few habits to get AI-powered insights about your progress.
          </p>
        </div>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'weakness':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'opportunity':
        return <Target className="h-5 w-5 text-blue-500" />;
      case 'pattern':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400';
      case 'low':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Motivational Message */}
      {motivationalContent && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 p-4 sm:p-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">✨</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Daily Motivation
            </h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 italic">
              "{motivationalContent.message}"
            </p>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {motivationalContent.affirmation}
            </div>
          </div>
        </Card>
      )}

      {/* Key Insights */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Key Insights
          </h2>
          <Badge variant="outline" className="w-fit">
            {insights.keyInsights.length} insights found
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {insights.keyInsights.map((insight, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {insight.title}
                    </h3>
                    <Badge 
                      size="sm" 
                      className={cn(getPriorityColor(insight.priority), "w-fit")}
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
                    {insight.description}
                  </p>
                  {insight.actionable && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Target className="h-3 w-3" />
                      <span>Actionable insight</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Habit Recommendations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Recommendations
          </h2>
          <Badge variant="outline">
            {insights.habitRecommendations.length} recommendations
          </Badge>
        </div>

        <div className="space-y-4">
          {insights.habitRecommendations.map((recommendation, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {recommendation.title}
                    </h3>
                    <Badge 
                      variant="outline" 
                      size="sm"
                      className={cn(
                        'capitalize',
                        recommendation.type === 'new' && 'bg-green-50 text-green-700 border-green-200',
                        recommendation.type === 'optimize' && 'bg-blue-50 text-blue-700 border-blue-200',
                        recommendation.type === 'modify' && 'bg-yellow-50 text-yellow-700 border-yellow-200',
                        recommendation.type === 'pause' && 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      {recommendation.type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {recommendation.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Impact:</span>
                      <span className={getImpactColor(recommendation.expectedImpact)}>
                        {recommendation.expectedImpact}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Difficulty:</span>
                      <span className={getImpactColor(recommendation.difficulty)}>
                        {recommendation.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary-500" />
          Recommended Next Steps
        </h3>
        <div className="space-y-3">
          {insights.nextSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-xs font-semibold text-primary-600 dark:text-primary-400">
                {index + 1}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {step}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Motivational Quote */}
      {motivationalContent?.quote && (
        <Card className="text-center bg-gray-50 dark:bg-gray-800">
          <div className="text-2xl mb-3">💭</div>
          <blockquote className="text-gray-700 dark:text-gray-300 italic mb-2">
            "{motivationalContent.quote}"
          </blockquote>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Daily inspiration
          </div>
        </Card>
      )}
    </div>
  );
};