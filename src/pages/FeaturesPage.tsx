import React from 'react';
import { PublicLayout } from '../components/layout';
import { Card, FloatingElements } from '../components/ui';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Brain, 
  Trophy, 
  Calendar,
  Bell,
  Shield,
  Zap,
  Heart
} from 'lucide-react';

const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: Target,
      title: 'Smart Habit Tracking',
      description: 'Track daily, weekly, or custom frequency habits with intelligent reminders and streak tracking.'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Visualize your progress with detailed charts, trends, and insights into your habit patterns.'
    },
    {
      icon: Trophy,
      title: 'Gamification System',
      description: 'Earn XP, level up, unlock achievements, and complete challenges to stay motivated.'
    },
    {
      icon: Users,
      title: 'Community Circles',
      description: 'Join or create communities to share progress, participate in group challenges, and stay accountable.'
    },
    {
      icon: Brain,
      title: 'AI Coaching',
      description: 'Get personalized recommendations, pattern analysis, and motivational support from AI.'
    },
    {
      icon: Heart,
      title: 'Wellbeing Tracking',
      description: 'Monitor your mood, energy levels, and understand how habits impact your overall wellbeing.'
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Set custom frequencies, specific days, and reminder times that fit your lifestyle.'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Receive timely reminders, milestone celebrations, and daily summaries with quiet hours support.'
    },
    {
      icon: Zap,
      title: 'Forgiveness Tokens',
      description: 'Maintain streaks even on tough days with automatic and earned forgiveness tokens.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is encrypted, secure, and you have full control over AI features and community visibility.'
    }
  ];

  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <FloatingElements variant="features" />
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Lasting Habits
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to build, track, and maintain positive habits with gamification, 
              AI coaching, and community support.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border-0 hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default FeaturesPage;
