import React from 'react';
import { PublicLayout } from '../components/layout';
import { Card, FloatingElements } from '../components/ui';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const BlogPage: React.FC = () => {
  const posts = [
    {
      title: 'The Science Behind Habit Formation',
      excerpt: 'Discover the psychological principles that make habits stick and how HabitForge leverages them.',
      date: '2024-01-15',
      readTime: '5 min read',
      category: 'Science'
    },
    {
      title: '10 Tips for Building Lasting Habits',
      excerpt: 'Practical strategies from behavioral psychology to help you build habits that actually stick.',
      date: '2024-01-10',
      readTime: '7 min read',
      category: 'Tips'
    },
    {
      title: 'How Gamification Boosts Motivation',
      excerpt: 'Learn how game mechanics like XP, levels, and achievements can supercharge your habit-building journey.',
      date: '2024-01-05',
      readTime: '6 min read',
      category: 'Features'
    },
    {
      title: 'The Power of Community Accountability',
      excerpt: 'Why joining a community circle can be the key to maintaining your habits long-term.',
      date: '2023-12-28',
      readTime: '4 min read',
      category: 'Community'
    },
    {
      title: 'Using AI for Personalized Habit Insights',
      excerpt: 'How artificial intelligence can help you understand your patterns and optimize your routine.',
      date: '2023-12-20',
      readTime: '8 min read',
      category: 'AI'
    },
    {
      title: 'Breaking Bad Habits: A Practical Guide',
      excerpt: 'Evidence-based strategies for identifying and replacing unwanted behaviors with positive ones.',
      date: '2023-12-15',
      readTime: '6 min read',
      category: 'Tips'
    }
  ];

  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <FloatingElements variant="blog" />
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              HabitForge Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Insights, tips, and stories about building better habits
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border-0 hover:scale-105">
              <div className="mb-4">
                <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {post.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            More articles coming soon. Subscribe to our newsletter to stay updated!
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default BlogPage;
