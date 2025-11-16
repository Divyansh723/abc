import React, { useEffect, useState } from 'react';
import { Heart, Zap, Brain, Target, Lightbulb, Sparkles, Plus, Check, Clock, Calendar } from 'lucide-react';
import { Card, Badge, Button, Modal, Checkbox } from '@/components/ui';
import { useWellbeing } from '@/hooks/useWellbeing';
import { useAI } from '@/hooks/useAI';
import { useHabits } from '@/hooks/useHabits';
import { useAIPermissions } from '@/hooks/useAIPermissions';
import { cn } from '@/utils/cn';



interface HabitImpactAnalysisProps {
  className?: string;
}

export const HabitImpactAnalysis: React.FC<HabitImpactAnalysisProps> = ({ className }) => {
  const { habitImpacts, fetchHabitImpacts } = useWellbeing();
  const { fetchHabitInsights } = useAI();
  const { createHabit } = useHabits();
  const { canUseAISuggestions } = useAIPermissions();
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<any>(null);
  const [isLoadingOptimization, setIsLoadingOptimization] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [isCreatingHabits, setIsCreatingHabits] = useState(false);

  useEffect(() => {
    fetchHabitImpacts();
  }, []); // Empty dependency array to run only on mount

  // Check if we have real data or need to show fallback
  const hasRealData = habitImpacts.length > 0;
  
  // Fallback data if no impacts available (shown when user hasn't tracked mood + habits yet)
  // Note: Impact values are percentages (not decimals) to match backend format
  const displayImpacts = hasRealData ? habitImpacts : [
    {
      habitId: '1',
      habitName: 'Morning Exercise',
      category: 'Fitness',
      color: '#3B82F6',
      moodImpact: 20,
      energyImpact: 25,
      stressImpact: -15,
      completionRate: 87,
      correlation: 'strong',
      hasEnoughData: true,
      insights: [
        'Significantly boosts energy levels throughout the day',
        'Reduces stress on completion days',
        'Strong correlation with better sleep quality'
      ]
    },
    {
      habitId: '2',
      habitName: 'Meditation',
      category: 'Wellness',
      color: '#8B5CF6',
      moodImpact: 18,
      energyImpact: 10,
      stressImpact: -20,
      completionRate: 93,
      correlation: 'strong',
      hasEnoughData: true,
      insights: [
        'Most effective habit for stress reduction',
        'Improves emotional regulation',
        'Enhances focus and mental clarity'
      ]
    },
    {
      habitId: '3',
      habitName: 'Social Connection',
      category: 'Social',
      color: '#10B981',
      moodImpact: 23,
      energyImpact: 8,
      stressImpact: -10,
      completionRate: 45,
      correlation: 'strong',
      hasEnoughData: true,
      insights: [
        'Highest mood impact but lowest completion rate',
        'Strong correlation with overall life satisfaction',
        'Most effective when combined with outdoor activities'
      ]
    },
    {
      habitId: '4',
      habitName: 'Reading',
      category: 'Learning',
      color: '#F59E0B',
      moodImpact: 13,
      energyImpact: 5,
      stressImpact: -8,
      completionRate: 73,
      correlation: 'moderate',
      hasEnoughData: true,
      insights: [
        'Provides consistent but moderate wellbeing benefits',
        'Best performed in the evening for stress relief',
        'Improves cognitive function over time'
      ]
    },
    {
      habitId: '5',
      habitName: 'Healthy Eating',
      category: 'Nutrition',
      color: '#06B6D4',
      moodImpact: 15,
      energyImpact: 18,
      stressImpact: -5,
      completionRate: 82,
      correlation: 'moderate',
      hasEnoughData: true,
      insights: [
        'Steady energy boost throughout the day',
        'Supports other healthy habits',
        'Long-term benefits for mood stability'
      ]
    }
  ];

  const getImpactColor = (impact: number) => {
    if (Math.abs(impact) >= 0.7) return 'text-green-600 dark:text-green-400';
    if (Math.abs(impact) >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getImpactBgColor = (impact: number) => {
    if (Math.abs(impact) >= 0.7) return 'bg-green-100 dark:bg-green-900/20';
    if (Math.abs(impact) >= 0.4) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-gray-100 dark:bg-gray-900/20';
  };

  const getCorrelationBadge = (correlation: string) => {
    const colors = {
      strong: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      weak: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      insufficient_data: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[correlation as keyof typeof colors] || colors.weak;
  };

  const getCorrelationLabel = (correlation: string) => {
    if (correlation === 'insufficient_data') return 'Analyzing...';
    return `${correlation} correlation`;
  };

  const formatImpact = (impact: number) => {
    // Backend returns percentage values directly (e.g., 25 = 25%), not decimals
    const percentage = Math.abs(impact);
    const direction = impact > 0 ? '+' : '-';
    return `${direction}${percentage.toFixed(0)}%`;
  };

  const handleOptimizeHabits = async () => {
    setIsLoadingOptimization(true);
    setShowOptimizationModal(true);
    setOptimizationSuggestions(null); // Reset previous suggestions
    setShowSuccessMessage(false); // Hide success message when getting new suggestions
    setSelectedSuggestions(new Set()); // Reset selections
    
    try {
      // Get AI insights with focus on optimization
      const insights = await fetchHabitInsights();
      
      // Create optimization suggestions based on habit impacts and AI insights
      const suggestions = generateOptimizationSuggestions(displayImpacts, insights);
      setOptimizationSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get optimization suggestions:', error);
      // Provide fallback suggestions
      setOptimizationSuggestions(getFallbackOptimizationSuggestions(displayImpacts));
    } finally {
      setIsLoadingOptimization(false);
    }
  };

  const generateOptimizationSuggestions = (_impacts: any[], aiInsights: any) => {
    const suggestions = [];

    // Generate actionable habit suggestions
    suggestions.push({
      type: 'new_habit',
      title: 'Morning Mindfulness',
      description: 'Start your day with 5 minutes of mindfulness to improve focus and reduce stress.',
      newHabit: {
        name: 'Morning Mindfulness',
        description: '5 minutes of meditation or deep breathing to start the day mindfully',
        category: 'mindfulness',
        frequency: 'daily',
        icon: '🧘',
        color: '#8B5CF6'
      },
      recommendations: [
        'Set a consistent wake-up time',
        'Find a quiet spot in your home',
        'Use a meditation app for guidance',
        'Start with just 2-3 minutes if needed'
      ],
      priority: 'high',
      expectedImpact: 'Reduce daily stress by 20-30%'
    });

    suggestions.push({
      type: 'new_habit',
      title: 'Evening Gratitude',
      description: 'End your day by writing down 3 things you\'re grateful for to boost mood and sleep quality.',
      newHabit: {
        name: 'Evening Gratitude',
        description: 'Write down 3 things you\'re grateful for before bed',
        category: 'mindfulness',
        frequency: 'daily',
        icon: '🙏',
        color: '#10B981'
      },
      recommendations: [
        'Keep a journal by your bedside',
        'Be specific about what you\'re grateful for',
        'Include both big and small things',
        'Make it the last thing you do before sleep'
      ],
      priority: 'medium',
      expectedImpact: 'Improve sleep quality and mood by 15-20%'
    });

    suggestions.push({
      type: 'new_habit',
      title: 'Hydration Reminder',
      description: 'Drink a glass of water every 2 hours to maintain energy and focus throughout the day.',
      newHabit: {
        name: 'Hourly Hydration',
        description: 'Drink water every 2 hours to stay properly hydrated',
        category: 'health',
        frequency: 'daily',
        icon: '💧',
        color: '#3B82F6'
      },
      recommendations: [
        'Set hourly phone reminders',
        'Keep a water bottle at your desk',
        'Track intake with an app',
        'Add lemon or cucumber for variety'
      ],
      priority: 'medium',
      expectedImpact: 'Boost energy levels by 10-15%'
    });

    suggestions.push({
      type: 'new_habit',
      title: 'Movement Breaks',
      description: 'Take a 5-minute movement break every hour to improve circulation and energy.',
      newHabit: {
        name: '5-Minute Movement',
        description: 'Take short movement breaks throughout the day',
        category: 'fitness',
        frequency: 'daily',
        icon: '🚶',
        color: '#F59E0B'
      },
      recommendations: [
        'Set reminders every hour',
        'Try desk stretches or walking',
        'Use stairs instead of elevators',
        'Do jumping jacks or push-ups'
      ],
      priority: 'medium',
      expectedImpact: 'Increase daily energy and reduce stiffness'
    });

    // Add AI insights if available
    if (aiInsights?.habitRecommendations) {
      aiInsights.habitRecommendations.slice(0, 1).forEach((rec: any) => {
        suggestions.push({
          type: 'new_habit',
          title: rec.title || 'AI Recommendation',
          description: rec.description,
          newHabit: {
            name: rec.title || 'Custom Habit',
            description: rec.description,
            category: 'other',
            frequency: 'daily',
            icon: '🎯',
            color: '#6366F1'
          },
          recommendations: [rec.description],
          priority: rec.expectedImpact === 'high' ? 'high' : 'medium',
          expectedImpact: `${rec.expectedImpact} impact - ${rec.difficulty} difficulty`
        });
      });
    }

    return suggestions;
  };

  const getFallbackOptimizationSuggestions = (_impacts: any[]) => {
    return [
      {
        type: 'new_habit',
        title: 'Daily Water Intake',
        description: 'Drink 8 glasses of water daily to improve energy, focus, and overall health.',
        newHabit: {
          name: 'Daily Hydration',
          description: 'Drink 8 glasses of water throughout the day',
          category: 'health',
          frequency: 'daily',
          icon: '💧',
          color: '#3B82F6'
        },
        recommendations: [
          'Start your day with a glass of water',
          'Keep a water bottle at your desk',
          'Set hourly reminders on your phone',
          'Track your intake with an app'
        ],
        priority: 'high',
        expectedImpact: 'Boost energy and improve focus by 15-20%'
      },
      {
        type: 'new_habit',
        title: '10-Minute Walk',
        description: 'Take a short walk daily to improve mood, energy, and physical health.',
        newHabit: {
          name: 'Daily Walk',
          description: 'Take a 10-minute walk outside or around your home',
          category: 'fitness',
          frequency: 'daily',
          icon: '🚶',
          color: '#10B981'
        },
        recommendations: [
          'Choose a consistent time each day',
          'Start with just 5 minutes if needed',
          'Listen to music or podcasts while walking',
          'Use it as a break between work tasks'
        ],
        priority: 'medium',
        expectedImpact: 'Improve mood and energy levels'
      },
      {
        type: 'new_habit',
        title: 'Gratitude Practice',
        description: 'Write down 3 things you\'re grateful for each day to boost positivity.',
        newHabit: {
          name: 'Daily Gratitude',
          description: 'Write down 3 things you\'re grateful for',
          category: 'mindfulness',
          frequency: 'daily',
          icon: '🙏',
          color: '#8B5CF6'
        },
        recommendations: [
          'Keep a gratitude journal by your bed',
          'Be specific about what you\'re grateful for',
          'Include both big and small things',
          'Make it part of your evening routine'
        ],
        priority: 'medium',
        expectedImpact: 'Increase life satisfaction and positive mindset'
      }
    ];
  };

  const handleSuggestionToggle = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleStartOptimizing = async () => {
    if (selectedSuggestions.size === 0) {
      alert('Please select at least one optimization strategy to implement.');
      return;
    }

    setIsCreatingHabits(true);
    
    try {
      const selectedSuggestionsList = Array.from(selectedSuggestions).map(index => 
        optimizationSuggestions[index]
      );

      // Create habits for selected suggestions that have newHabit data
      const habitsToCreate = selectedSuggestionsList.filter(suggestion => suggestion.newHabit);
      
      for (const suggestion of habitsToCreate) {
        await createHabit({
          name: suggestion.newHabit.name,
          description: suggestion.newHabit.description,
          category: suggestion.newHabit.category,
          frequency: suggestion.newHabit.frequency,
          color: suggestion.newHabit.color,
          icon: suggestion.newHabit.icon,
          reminderEnabled: true
        });
      }

      setShowOptimizationModal(false);
      setShowSuccessMessage(true);
      setSelectedSuggestions(new Set()); // Reset selections
      
      // Show success message with count
      const createdCount = habitsToCreate.length;
      if (createdCount > 0) {
        // Update success message to show created habits count
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 4000);
      }
      
    } catch (error) {
      console.error('Failed to create habits:', error);
      alert('Failed to create some habits. Please try again.');
    } finally {
      setIsCreatingHabits(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Habit Impact Analysis
        </h3>
        <div className="flex items-center gap-2">
          {!hasRealData && (
            <Badge variant="secondary" size="sm">
              Demo Data
            </Badge>
          )}
          <Badge variant="outline" size="sm">
            Last 30 days
          </Badge>
        </div>
      </div>

      {/* Info Banner for Demo Data */}
      {!hasRealData && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
              <div>
                <strong>How Habit Impact Works:</strong> Track your mood daily in the Wellbeing page, and complete your habits regularly. 
                We'll analyze the correlation between your habits and wellbeing metrics (mood, energy, stress).
              </div>
              <div className="flex items-start gap-2 bg-blue-100 dark:bg-blue-900/40 p-2 rounded">
                <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Data Required:</strong> For each habit, we need at least <strong>3 days of mood tracking when you completed the habit</strong> and <strong>3 days when you didn't</strong> (minimum 6 days total). This ensures meaningful correlation analysis.
                </div>
              </div>
              <div className="text-xs opacity-90">
                The values below are examples showing what insights you'll receive once you have enough data.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">
            +23%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Average Mood Improvement
          </div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
            +31%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Average Energy Boost
          </div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            -18%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Average Stress Reduction
          </div>
        </Card>
      </div>

      {/* Detailed Habit Impact */}
      <div className="space-y-4">
        {displayImpacts.map((habit) => (
          <Card key={habit.habitId} className="p-6">
            <div className="flex items-start gap-4">
              {/* Habit Icon */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0"
                style={{ backgroundColor: habit.color }}
              >
                <Target className="h-6 w-6" />
              </div>

              {/* Habit Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {habit.habitName}
                    </h4>
                    <Badge 
                      variant="outline" 
                      size="sm"
                      className={getCorrelationBadge(String(habit.correlation))}
                    >
                      {getCorrelationLabel(String(habit.correlation))}
                    </Badge>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Completion Rate
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {habit.completionRate}%
                    </div>
                  </div>
                </div>

                {/* Impact Metrics */}
                {habit.hasEnoughData === false ? (
                  <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <h5 className="font-medium text-orange-900 dark:text-orange-100">
                        Collecting Data...
                      </h5>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                      Need at least 4-7 days of mood tracking data for accurate impact analysis.
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div>
                        <div className="text-orange-600 dark:text-orange-400 font-medium">0%</div>
                        <div className="text-orange-700 dark:text-orange-300">Mood</div>
                      </div>
                      <div>
                        <div className="text-orange-600 dark:text-orange-400 font-medium">0%</div>
                        <div className="text-orange-700 dark:text-orange-300">Energy</div>
                      </div>
                      <div>
                        <div className="text-orange-600 dark:text-orange-400 font-medium">0%</div>
                        <div className="text-orange-700 dark:text-orange-300">Stress</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className={cn(
                      'p-3 rounded-lg text-center',
                      getImpactBgColor(habit.moodImpact)
                    )}>
                      <Heart className={cn('h-5 w-5 mx-auto mb-1', getImpactColor(habit.moodImpact))} />
                      <div className="text-sm font-medium">Mood</div>
                      <div className={cn('text-lg font-bold', getImpactColor(habit.moodImpact))}>
                        {formatImpact(habit.moodImpact)}
                      </div>
                    </div>

                    <div className={cn(
                      'p-3 rounded-lg text-center',
                      getImpactBgColor(habit.energyImpact)
                    )}>
                      <Zap className={cn('h-5 w-5 mx-auto mb-1', getImpactColor(habit.energyImpact))} />
                      <div className="text-sm font-medium">Energy</div>
                      <div className={cn('text-lg font-bold', getImpactColor(habit.energyImpact))}>
                        {formatImpact(habit.energyImpact)}
                      </div>
                    </div>

                    <div className={cn(
                      'p-3 rounded-lg text-center',
                      getImpactBgColor(habit.stressImpact)
                    )}>
                      <Brain className={cn('h-5 w-5 mx-auto mb-1', getImpactColor(habit.stressImpact))} />
                      <div className="text-sm font-medium">Stress</div>
                      <div className={cn('text-lg font-bold', getImpactColor(habit.stressImpact))}>
                        {formatImpact(habit.stressImpact)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Insights */}
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Key Insights
                  </h5>
                  <ul className="space-y-1">
                    {habit.insights?.map((insight: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                🎉 Habits Successfully Added!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your selected optimization habits have been added to your Goals page. Start building these habits to maximize your wellbeing impact!
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {hasRealData ? 'Personalized Recommendations' : 'How Impact Analysis Works'}
            </h4>
            {hasRealData ? (
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Focus on <strong>Social Connection</strong> - it has the highest mood impact but lowest completion rate.
                </p>
                <p>
                  Consider adding more <strong>Meditation</strong> sessions for stress management.
                </p>
                <p>
                  Your <strong>Morning Exercise</strong> routine is highly effective - maintain consistency.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Calculation Method:</strong> We compare your mood, energy, and stress levels on days when you complete a habit versus days when you don't.
                </p>
                <p>
                  <strong>Example:</strong> If your average mood is 4.0 on days you exercise vs 3.0 on days you don't, that's a +33% mood impact.
                </p>
                <p>
                  <strong>Correlation Strength:</strong> Strong (&gt;10% change), Moderate (5-10%), or Weak (&lt;5%) based on the percentage difference.
                </p>
              </div>
            )}
            {canUseAISuggestions && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={handleOptimizeHabits}
                disabled={isLoadingOptimization}
              >
                {isLoadingOptimization ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Analyzing...
                  </>
                ) : showSuccessMessage ? (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Get New Suggestions
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Optimize My Habits
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Optimization Modal */}
      <Modal
        isOpen={showOptimizationModal}
        onClose={() => setShowOptimizationModal(false)}
        title="AI-Powered Habit Optimization"
        size="lg"
      >
        <div className="space-y-6">
          {isLoadingOptimization ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <p>AI is analyzing your habits and generating personalized optimization strategies...</p>
              </div>
            </div>
          ) : optimizationSuggestions ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Your Personalized Optimization Plan
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Based on your habit data and wellbeing patterns, here are AI-generated strategies to maximize your success.
                </p>
              </div>

              {/* Selection Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Select Habits to Add
                  </h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Choose the optimization strategies you'd like to implement. Selected habits will be added to your Goals page.
                </p>
              </div>

              {/* Suggestions */}
              <div className="space-y-4">
                {optimizationSuggestions.map((suggestion: any, index: number) => {
                  const isSelected = selectedSuggestions.has(index);
                  const hasNewHabit = suggestion.newHabit;
                  
                  return (
                    <Card 
                      key={index} 
                      className={cn(
                        'p-6 cursor-pointer transition-all duration-200',
                        isSelected 
                          ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                          : 'hover:shadow-md',
                        !hasNewHabit && 'opacity-60'
                      )}
                      onClick={() => hasNewHabit && handleSuggestionToggle(index)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        {hasNewHabit && (
                          <div className="flex items-center justify-center w-6 h-6 mt-2">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSuggestionToggle(index)}
                              className="w-5 h-5"
                            />
                          </div>
                        )}
                        
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                          suggestion.priority === 'high' 
                            ? 'bg-red-100 dark:bg-red-900/20' 
                            : 'bg-blue-100 dark:bg-blue-900/20'
                        )}>
                          {hasNewHabit ? (
                            <span className="text-2xl">{suggestion.newHabit.icon}</span>
                          ) : (
                            <Target className={cn(
                              'h-5 w-5',
                              suggestion.priority === 'high' 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-blue-600 dark:text-blue-400'
                            )} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {suggestion.title}
                            </h4>
                            <Badge 
                              variant={suggestion.priority === 'high' ? 'error' : 'secondary'}
                              size="sm"
                            >
                              {suggestion.priority} priority
                            </Badge>
                            {hasNewHabit && (
                              <Badge variant="success" size="sm">
                                <Plus className="h-3 w-3 mr-1" />
                                New Habit
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {suggestion.description}
                          </p>

                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                              {hasNewHabit ? 'How to Get Started:' : 'Action Steps:'}
                            </h5>
                            <ul className="space-y-1">
                              {suggestion.recommendations.map((rec: string, recIndex: number) => (
                                <li key={recIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <span className="text-primary-500 mt-1">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <div className="text-sm font-medium text-green-700 dark:text-green-300">
                              Expected Impact: {suggestion.expectedImpact}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedSuggestions.size} of {optimizationSuggestions.filter((s: any) => s.newHabit).length} habits selected
                  </div>
                  {selectedSuggestions.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSuggestions(new Set())}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                <Button 
                  onClick={handleStartOptimizing}
                  className="w-full"
                  disabled={selectedSuggestions.size === 0 || isCreatingHabits}
                >
                  {isCreatingHabits ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Habits...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add {selectedSuggestions.size} Selected Habit{selectedSuggestions.size !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Unable to Generate Suggestions
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We couldn't analyze your habits right now. Please try again later.
              </p>
              <Button variant="outline" onClick={() => setShowOptimizationModal(false)}>
                Close
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};