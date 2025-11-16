import React, { useState } from 'react';
import { MessageCircle, Heart, Sparkles, RefreshCw, Send, Target } from 'lucide-react';
import { Card, Badge, Button, Input, Textarea } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { MotivationalContent } from '@/services/aiService';
import { useAI } from '@/hooks/useAI';

interface MotivationalCoachProps {
  motivationalContent: MotivationalContent | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const MotivationalCoach: React.FC<MotivationalCoachProps> = ({
  motivationalContent,
  isLoading,
  onRefresh
}) => {
  const { getPersonalizedCoaching } = useAI();
  const [challenge, setChallenge] = useState('');
  const [context, setContext] = useState('');
  const [coachingResponse, setCoachingResponse] = useState<any>(null);
  const [isGettingCoaching, setIsGettingCoaching] = useState(false);

  const handleGetCoaching = async () => {
    if (!challenge.trim()) return;

    setIsGettingCoaching(true);
    try {
      const response = await getPersonalizedCoaching(challenge, context);
      setCoachingResponse(response);
      setChallenge('');
      setContext('');
    } catch (error) {
      console.error('Failed to get coaching:', error);
    } finally {
      setIsGettingCoaching(false);
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'encouraging':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'celebratory':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'supportive':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'energizing':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const quickChallenges = [
    "I'm struggling to stay consistent with my morning routine",
    "I keep breaking my streaks on weekends",
    "I feel overwhelmed with too many habits",
    "I lack motivation to start new habits",
    "I want to build better evening habits"
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your AI Habit Coach
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get personalized motivation, advice, and support for your habit journey
            </p>
          </div>
        </div>
      </Card>

      {/* Daily Motivation */}
      {motivationalContent && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daily Motivation
                </h3>
                <Badge className={getToneColor(motivationalContent.tone)}>
                  {motivationalContent.tone}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="ml-auto"
                >
                  <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{motivationalContent.message}"
                </p>

                {motivationalContent.quote && (
                  <blockquote className="border-l-4 border-purple-300 pl-4 text-gray-600 dark:text-gray-400">
                    "{motivationalContent.quote}"
                  </blockquote>
                )}

                {motivationalContent.affirmation && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                      Your Daily Affirmation
                    </h4>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      {motivationalContent.affirmation}
                    </p>
                  </div>
                )}

                {motivationalContent.tips && motivationalContent.tips.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Today's Tips
                    </h4>
                    <ul className="space-y-1">
                      {motivationalContent.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {motivationalContent.challenge && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                        Today's Challenge
                      </h4>
                    </div>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      {motivationalContent.challenge}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Interactive Coaching */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Ask Your AI Coach
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What challenge are you facing?
            </label>
            <Textarea
              placeholder="Describe your habit challenge or what you need help with..."
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional context (optional)
            </label>
            <Input
              placeholder="e.g., 'I work night shifts', 'I have young kids', 'I travel frequently'"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleGetCoaching}
              disabled={!challenge.trim() || isGettingCoaching}
              className="flex items-center gap-2"
            >
              {isGettingCoaching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Getting advice...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Get Coaching
                </>
              )}
            </Button>
          </div>

          {/* Quick Challenge Buttons */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Or try one of these common challenges:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickChallenges.map((quickChallenge, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setChallenge(quickChallenge)}
                  className="text-xs"
                >
                  {quickChallenge}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Coaching Response */}
      {coachingResponse && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Personalized Coaching Response
                </h3>
                <Badge className={getToneColor(coachingResponse.tone)}>
                  {coachingResponse.tone}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {coachingResponse.message}
                </p>

                {coachingResponse.tips && coachingResponse.tips.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Actionable Tips
                    </h4>
                    <ul className="space-y-2">
                      {coachingResponse.tips.map((tip: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">💡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {coachingResponse.challenge && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Recommended Challenge
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {coachingResponse.challenge}
                    </p>
                  </div>
                )}

                {coachingResponse.affirmation && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                      Affirmation for You
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm italic">
                      "{coachingResponse.affirmation}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State for Daily Motivation */}
      {isLoading && !motivationalContent && (
        <Card className="animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};