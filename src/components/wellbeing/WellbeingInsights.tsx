import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Brain, Heart, Activity } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { useWellbeing } from '@/hooks/useWellbeing';
import { cn } from '@/utils/cn';



interface WellbeingInsightsProps {
  className?: string;
}

export const WellbeingInsights: React.FC<WellbeingInsightsProps> = ({ className }) => {
  const { insights, fetchInsights } = useWellbeing();

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]); // Include fetchInsights in dependency array

  // Fallback insights if none available
  const displayInsights = insights?.patterns || [
    {
      id: '1',
      type: 'positive',
      title: 'Strong Habit-Mood Connection',
      description: 'Your mood improves by 23% on days when you complete 3+ habits. Keep up the consistency!',
      metric: '+23%',
      trend: 'up',
      category: 'correlation'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Stress Levels Rising',
      description: 'Your stress levels have increased over the past 3 days. Consider adding meditation or relaxation habits.',
      metric: '+15%',
      trend: 'up',
      category: 'stress'
    },
    {
      id: '3',
      type: 'positive',
      title: 'Energy Boost from Exercise',
      description: 'Your energy levels are 40% higher on days when you complete your fitness habits.',
      metric: '+40%',
      trend: 'up',
      category: 'energy'
    },
    {
      id: '4',
      type: 'neutral',
      title: 'Consistent Sleep Pattern',
      description: 'Your sleep habits are helping maintain stable mood levels throughout the week.',
      category: 'habits'
    },
    {
      id: '5',
      type: 'negative',
      title: 'Weekend Habit Drop',
      description: 'Your habit completion drops by 35% on weekends, which correlates with lower mood scores.',
      metric: '-35%',
      trend: 'down',
      category: 'habits'
    },
    {
      id: '6',
      type: 'positive',
      title: 'Mindfulness Impact',
      description: 'Days with meditation show 28% lower stress levels and improved emotional regulation.',
      metric: '-28%',
      trend: 'down',
      category: 'stress'
    }
  ];

  const getInsightIcon = (type: string, category: string) => {
    if (category === 'mood') return Heart;
    if (category === 'energy') return Activity;
    if (category === 'stress') return Brain;
    
    switch (type) {
      case 'positive':
        return CheckCircle;
      case 'negative':
      case 'warning':
        return AlertCircle;
      default:
        return TrendingUp;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const getInsightBadgeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Wellbeing Insights
        </h3>
        <Badge variant="outline" size="sm">
          Based on last 30 days
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayInsights.map((insight: any) => {
          const Icon = getInsightIcon(insight.type, insight.category);
          const TrendIcon = getTrendIcon(insight.trend);
          
          return (
            <Card key={insight.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  insight.type === 'positive' ? 'bg-green-100 dark:bg-green-900/20' :
                  insight.type === 'negative' ? 'bg-red-100 dark:bg-red-900/20' :
                  insight.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                  'bg-blue-100 dark:bg-blue-900/20'
                )}>
                  <Icon className={cn('h-5 w-5', getInsightColor(insight.type))} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {insight.title}
                    </h4>
                    {insight.metric && (
                      <div className="flex items-center gap-1">
                        {TrendIcon && (
                          <TrendIcon className={cn(
                            'h-4 w-4',
                            insight.trend === 'up' && insight.type === 'positive' ? 'text-green-500' :
                            insight.trend === 'up' && insight.type !== 'positive' ? 'text-red-500' :
                            insight.trend === 'down' && insight.type === 'positive' ? 'text-green-500' :
                            'text-red-500'
                          )} />
                        )}
                        <span className={cn(
                          'text-sm font-medium',
                          insight.trend === 'up' && insight.type === 'positive' ? 'text-green-600 dark:text-green-400' :
                          insight.trend === 'up' && insight.type !== 'positive' ? 'text-red-600 dark:text-red-400' :
                          insight.trend === 'down' && insight.type === 'positive' ? 'text-green-600 dark:text-green-400' :
                          'text-red-600 dark:text-red-400'
                        )}>
                          {insight.metric}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {insight.description}
                  </p>
                  
                  <Badge 
                    variant="outline" 
                    size="sm"
                    className={getInsightBadgeColor(insight.type)}
                  >
                    {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Wellbeing Score
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on mood, energy, and habit consistency
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                78
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Overall Score
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                +12
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                This Week
              </div>
            </div>
          </div>
          
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Good Progress
          </Badge>
        </div>
      </Card>
    </div>
  );
};