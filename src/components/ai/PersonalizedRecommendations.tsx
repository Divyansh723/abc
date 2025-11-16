import React from 'react';
import { Target, Zap, Settings, Pause, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { AIInsights } from '@/services/aiService';

interface PersonalizedRecommendationsProps {
  insights: AIInsights | null;
  isLoading: boolean;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  insights,
  isLoading
}) => {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'optimize':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'modify':
        return <Settings className="h-5 w-5 text-yellow-500" />;
      case 'new':
        return <Plus className="h-5 w-5 text-green-500" />;
      case 'pause':
        return <Pause className="h-5 w-5 text-red-500" />;
      default:
        return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'optimize':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'modify':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'new':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pause':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'hard':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

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

  if (!insights || !insights.habitRecommendations.length) {
    return (
      <Card className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No recommendations available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete more habits to get personalized optimization recommendations.
          </p>
        </div>
      </Card>
    );
  }

  // Group recommendations by type
  const groupedRecommendations = insights.habitRecommendations.reduce((acc, rec) => {
    if (!acc[rec.type]) {
      acc[rec.type] = [];
    }
    acc[rec.type].push(rec);
    return acc;
  }, {} as Record<string, typeof insights.habitRecommendations>);

  const recommendationTypes = [
    { 
      key: 'optimize', 
      title: 'Optimize Existing Habits', 
      description: 'Improve your current habits for better results',
      icon: Zap,
      color: 'blue'
    },
    { 
      key: 'modify', 
      title: 'Modify Approach', 
      description: 'Adjust your habits to overcome challenges',
      icon: Settings,
      color: 'yellow'
    },
    { 
      key: 'new', 
      title: 'Add New Habits', 
      description: 'Expand your routine with complementary habits',
      icon: Plus,
      color: 'green'
    },
    { 
      key: 'pause', 
      title: 'Consider Pausing', 
      description: 'Temporarily pause habits that aren\'t working',
      icon: Pause,
      color: 'red'
    }
  ];

  // Calculate actual counts from recommendations that will be displayed
  // Only count recommendations that have a matching type in recommendationTypes
  const visibleRecommendations = recommendationTypes
    .filter(type => groupedRecommendations[type.key] && groupedRecommendations[type.key].length > 0)
    .flatMap(type => groupedRecommendations[type.key]);
  
  const totalCount = visibleRecommendations.length;
  const highImpactCount = visibleRecommendations.filter(r => r.expectedImpact === 'high').length;
  const easyCount = visibleRecommendations.filter(r => r.difficulty === 'easy').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
            <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Personalized Optimization
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              AI-powered recommendations to improve your habit success
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {totalCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Recommendations
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {highImpactCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              High Impact
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {easyCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Easy to Implement
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations by Type */}
      {recommendationTypes.map((type) => {
        const recommendations = groupedRecommendations[type.key];
        if (!recommendations || recommendations.length === 0) return null;

        const Icon = type.icon;

        return (
          <div key={type.key} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                type.color === 'blue' && 'bg-blue-100 dark:bg-blue-900',
                type.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900',
                type.color === 'green' && 'bg-green-100 dark:bg-green-900',
                type.color === 'red' && 'bg-red-100 dark:bg-red-900'
              )}>
                <Icon className={cn(
                  'h-4 w-4',
                  type.color === 'blue' && 'text-blue-600 dark:text-blue-400',
                  type.color === 'yellow' && 'text-yellow-600 dark:text-yellow-400',
                  type.color === 'green' && 'text-green-600 dark:text-green-400',
                  type.color === 'red' && 'text-red-600 dark:text-red-400'
                )} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">
                {recommendations.length} {recommendations.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((recommendation, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getRecommendationIcon(recommendation.type)}
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {recommendation.title}
                      </h4>
                    </div>
                    <Badge 
                      variant="outline" 
                      size="sm"
                      className={getRecommendationColor(recommendation.type)}
                    >
                      {recommendation.type}
                    </Badge>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {recommendation.description}
                  </p>

                  <div className="flex items-center justify-between text-xs mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Impact:</span>
                        <span className={getImpactColor(recommendation.expectedImpact)}>
                          {recommendation.expectedImpact}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Difficulty:</span>
                        <span className={getDifficultyColor(recommendation.difficulty)}>
                          {recommendation.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <span>Apply Recommendation</span>
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Quick Wins Section */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Quick Wins
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm mb-4">
              Start with these easy, high-impact recommendations for immediate results:
            </p>
            <div className="space-y-2">
              {insights.habitRecommendations
                .filter(r => r.difficulty === 'easy' && r.expectedImpact === 'high')
                .slice(0, 3)
                .map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <span className="text-green-500">✓</span>
                    <span>{rec.title}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};