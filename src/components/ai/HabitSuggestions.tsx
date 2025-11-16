import React, { useState } from 'react';
import { Plus, Lightbulb, Clock, Target, Sparkles, RefreshCw } from 'lucide-react';
import { Card, Badge, Button, Input } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { HabitSuggestion } from '@/services/aiService';
import { useHabits } from '@/hooks/useHabits';

interface HabitSuggestionsProps {
  suggestions: HabitSuggestion[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const HabitSuggestions: React.FC<HabitSuggestionsProps> = ({
  suggestions,
  isLoading,
  onRefresh
}) => {
  const { createHabit } = useHabits();
  const [goals, setGoals] = useState<string>('');
  const [creatingHabitId, setCreatingHabitId] = useState<string | null>(null);

  const handleCreateHabit = async (suggestion: HabitSuggestion) => {
    try {
      setCreatingHabitId(suggestion.name);
      
      await createHabit({
        name: suggestion.name,
        description: suggestion.description,
        category: suggestion.category as any,
        frequency: suggestion.frequency,
        color: suggestion.color,
        icon: suggestion.icon,
        reminderEnabled: false
      });

      // Show success feedback
      alert(`Successfully created "${suggestion.name}" habit!`);
    } catch (error) {
      console.error('Failed to create habit:', error);
      alert('Failed to create habit. Please try again.');
    } finally {
      setCreatingHabitId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      health: 'bg-green-50 text-green-700 border-green-200',
      fitness: 'bg-blue-50 text-blue-700 border-blue-200',
      productivity: 'bg-purple-50 text-purple-700 border-purple-200',
      learning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      mindfulness: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      social: 'bg-pink-50 text-pink-700 border-pink-200',
      creativity: 'bg-orange-50 text-orange-700 border-orange-200',
      finance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      other: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (isLoading && suggestions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <p>AI is generating personalized habit suggestions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header with Goals Input */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Smart Habit Suggestions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              AI-powered recommendations based on your current habits and goals
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Tell AI about your goals..."
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="flex-1 text-sm sm:text-base"
          />
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 w-full sm:w-auto whitespace-nowrap"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            <span className="hidden sm:inline">{isLoading ? 'Generating...' : 'Get New Suggestions'}</span>
            <span className="sm:hidden">{isLoading ? 'Generating...' : 'Refresh'}</span>
          </Button>
        </div>
      </Card>

      {/* Suggestions Grid */}
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 group p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0"
                      style={{ backgroundColor: suggestion.color }}
                    >
                      {suggestion.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                        {suggestion.name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        size="sm"
                        className={cn(getCategoryColor(suggestion.category), "text-xs")}
                      >
                        {suggestion.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {suggestion.description}
                </p>

                {/* Metadata */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-500">{suggestion.timeCommitment}</span>
                    </div>
                    <Badge 
                      size="sm" 
                      className={getDifficultyColor(suggestion.difficulty)}
                    >
                      {suggestion.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Target className="h-3 w-3" />
                    <span>{suggestion.frequency}</span>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Expected Benefits
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.expectedBenefits.slice(0, 3).map((benefit, i) => (
                      <Badge key={i} variant="outline" size="sm" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Starting Tips */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Getting Started
                  </h4>
                  <ul className="space-y-1">
                    {suggestion.startingTips.slice(0, 2).map((tip, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                        <span className="text-primary-500 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Reasoning */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                        Why AI suggests this
                      </h4>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        {suggestion.reasoning}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleCreateHabit(suggestion)}
                  disabled={creatingHabitId === suggestion.name}
                  className="w-full group-hover:shadow-md transition-shadow"
                >
                  {creatingHabitId === suggestion.name ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add This Habit
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No suggestions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some goals above and click "Get New Suggestions" to receive AI-powered habit recommendations.
            </p>
            <Button onClick={onRefresh} disabled={isLoading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Suggestions
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};