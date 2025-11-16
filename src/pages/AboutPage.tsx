import React from 'react';
import { PublicLayout } from '../components/layout';
import { Card, FloatingElements } from '../components/ui';
import { Target, Heart, Users, Zap } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <FloatingElements variant="about" />
        <div className="relative max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About HabitForge
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Building better habits, one day at a time
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">

        <div className="prose dark:prose-invert max-w-none mb-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              HabitForge was created with a simple mission: to help people build lasting positive habits 
              through intelligent tracking, gamification, and community support. We believe that small, 
              consistent actions lead to remarkable transformations.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By combining proven behavioral science with modern technology, we've created a platform 
              that makes habit building engaging, rewarding, and sustainable. Whether you're looking to 
              improve your health, productivity, or overall wellbeing, HabitForge provides the tools and 
              support you need to succeed.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Our Vision
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              To become the world's most effective habit-building platform, empowering millions 
              to achieve their personal growth goals through sustainable behavior change.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-blue-500/20 border-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Our Values
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Privacy, simplicity, and user empowerment guide everything we do. Your data is yours, 
              and we're committed to keeping it secure and giving you full control.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-500/10 via-blue-500/10 to-purple-500/10 dark:from-pink-500/20 dark:via-blue-500/20 dark:to-purple-500/20 border-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Community First
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              We believe in the power of community support. Our platform enables users to connect, 
              share experiences, and motivate each other on their habit-building journeys.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 via-pink-500/10 to-purple-500/10 dark:from-blue-500/20 dark:via-pink-500/20 dark:to-purple-500/20 border-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Innovation
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              We continuously innovate with AI-powered insights, gamification mechanics, and 
              behavioral science to make habit building more effective and enjoyable.
            </p>
          </Card>
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Join Our Journey
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-center">
            We're constantly improving HabitForge based on user feedback and the latest research 
            in behavioral psychology. Join thousands of users who are transforming their lives, 
            one habit at a time.
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default AboutPage;
