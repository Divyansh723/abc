import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Target, 
  Users, 
  Brain, 
  Trophy, 
  Star,
  CheckCircle,
  ArrowRight,
  Quote,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  Award,
  Heart,
  Flame
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthModal } from '@/components/auth/AuthModal';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';

const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthMode('register');
      setShowAuthModal(true);
    }
  };

  const handleSignIn = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthMode('login');
      setShowAuthModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };
  const features = [
    {
      icon: Target,
      title: 'Smart Habit Tracking',
      description: 'Create custom habits with flexible scheduling and intelligent reminders that adapt to your timezone.',
      color: 'text-primary-600 dark:text-primary-400'
    },
    {
      icon: Zap,
      title: 'Gamified Experience',
      description: 'Earn XP, level up, build streaks, and unlock achievements as you build better habits.',
      color: 'text-warning-600 dark:text-warning-400'
    },
    {
      icon: Brain,
      title: 'AI-Powered Coaching',
      description: 'Get personalized motivational messages and insights powered by advanced AI technology.',
      color: 'text-secondary-600 dark:text-secondary-400'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join circles, share progress, and stay accountable with like-minded habit builders.',
      color: 'text-success-600 dark:text-success-400'
    },
    {
      icon: Trophy,
      title: 'Detailed Analytics',
      description: 'Track your progress with beautiful charts, trends, and insights to optimize your habits.',
      color: 'text-error-600 dark:text-error-400'
    },
    {
      icon: CheckCircle,
      title: 'Forgiveness System',
      description: 'Stay motivated with forgiveness tokens and recovery challenges when life gets in the way.',
      color: 'text-primary-600 dark:text-primary-400'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      avatar: '👩‍💼',
      content: 'HabitForge transformed my morning routine. The AI coaching keeps me motivated, and the community support is incredible!',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Fitness Enthusiast',
      avatar: '🏃‍♂️',
      content: 'The gamification aspect makes building habits actually fun. I\'ve maintained a 90-day streak thanks to this app!',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'Student',
      avatar: '👩‍🎓',
      content: 'Perfect for busy schedules. The forgiveness system helped me stay consistent even during exam periods.',
      rating: 5
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '2M+', label: 'Habits Completed' },
    { value: '95%', label: 'Success Rate' },
    { value: '4.9★', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center space-x-3 group">
                  {/* Logo Icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <Zap className="h-6 w-6 text-white" fill="white" />
                  </div>
                  {/* Logo Text */}
                  <span className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    HabitForge
                  </span>
                </Link>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Testimonials
                </a>
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={handleSignIn}>
                  {user ? 'Dashboard' : 'Sign In'}
                </Button>
                <Button size="sm" onClick={handleGetStarted}>
                  {user ? 'Go to App' : 'Get Started'}
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
                <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Testimonials
                </a>
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" onClick={handleSignIn} className="w-full">
                      {user ? 'Dashboard' : 'Sign In'}
                    </Button>
                    <Button onClick={handleGetStarted} className="w-full">
                      {user ? 'Go to App' : 'Get Started'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Floating animated elements */}
        <div className="absolute top-20 left-10 animate-float opacity-20">
          <Sparkles className="h-12 w-12 text-primary-500" />
        </div>
        <div className="absolute top-40 right-20 animate-float opacity-20" style={{ animationDelay: '1s' }}>
          <Trophy className="h-16 w-16 text-secondary-500" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float opacity-20" style={{ animationDelay: '2s' }}>
          <Target className="h-14 w-14 text-primary-400" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float opacity-20" style={{ animationDelay: '0.5s' }}>
          <Flame className="h-12 w-12 text-orange-500" />
        </div>
        <div className="absolute top-1/2 left-1/4 animate-float opacity-10" style={{ animationDelay: '1.5s' }}>
          <Star className="h-10 w-10 text-yellow-400" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float opacity-10" style={{ animationDelay: '2.5s' }}>
          <Heart className="h-10 w-10 text-pink-400" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Logo */}
            <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Zap className="h-12 w-12 sm:h-14 sm:w-14 text-white" fill="white" strokeWidth={2} />
              </div>
            </div>
            
            <Badge variant="primary" className="mb-4 sm:mb-6 animate-fade-in text-xs sm:text-sm">
              🚀 New: AI-Powered Habit Coaching
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 animate-slide-up">
              Build Better{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Habits
              </span>
              <br />
              Transform Your Life
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto animate-slide-up px-4">
              Join thousands who are building lasting habits with gamified tracking, 
              AI coaching, and community support. Start your transformation today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-8 sm:mb-12 animate-slide-up px-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                rightIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}
                onClick={handleGetStarted}
              >
                {user ? 'Go to Dashboard' : 'Start Building Habits'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                leftIcon={<Target className="h-4 w-4 sm:h-5 sm:w-5" />}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto px-4">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center transform hover:scale-110 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Powerful features designed to make habit building engaging, sustainable, and rewarding.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card 
                    className="text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-4 sm:p-6 group cursor-pointer border-2 hover:border-primary-400"
                  >
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6">
                      <Icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Simple & Effective
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Start building better habits in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Create Your Habits',
                description: 'Set up your daily habits with custom schedules and reminders',
                icon: Target,
                color: 'from-yellow-400 to-orange-500'
              },
              {
                step: '2',
                title: 'Track Progress',
                description: 'Mark habits complete, build streaks, and earn XP points',
                icon: TrendingUp,
                color: 'from-green-400 to-emerald-500'
              },
              {
                step: '3',
                title: 'Level Up',
                description: 'Unlock achievements, join challenges, and transform your life',
                icon: Award,
                color: 'from-purple-400 to-pink-500'
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="relative animate-slide-in-left"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                    <div className="flex items-center justify-center mb-6">
                      <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-10 w-10 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 text-6xl font-bold text-white/10">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 text-center">
                      {item.title}
                    </h3>
                    <p className="text-primary-100 text-center">
                      {item.description}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-white/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Habit Builders Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our community has to say about their transformation journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.15}s` }}>
                <Card 
                  className="relative hover:shadow-2xl transition-all duration-500 hover:-translate-y-2" 
                  padding="lg"
                >
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary-200 dark:text-primary-800" />
                
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-warning-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </p>
              </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 animate-gradient relative overflow-hidden">
        {/* Floating particles */}
        <div className="absolute top-10 left-10 animate-float opacity-30">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 animate-float opacity-30" style={{ animationDelay: '1s' }}>
          <Trophy className="h-10 w-10 text-yellow-300" />
        </div>
        <div className="absolute top-1/2 left-20 animate-float opacity-20" style={{ animationDelay: '2s' }}>
          <Star className="h-6 w-6 text-yellow-200" />
        </div>
        <div className="absolute top-20 right-1/4 animate-float opacity-20" style={{ animationDelay: '0.5s' }}>
          <Zap className="h-8 w-8 text-yellow-300" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Habits?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already started their journey to better habits. 
            Start free today, no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="secondary" 
              size="lg" 
              className="text-lg px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold border-0"
              rightIcon={<ArrowRight className="h-5 w-5" />}
              onClick={handleGetStarted}
            >
              {user ? 'Go to Dashboard' : 'Get Started Free'}
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              className="text-lg px-8 py-4 text-white border-2 border-white hover:bg-white hover:text-primary-600 transition-all duration-300 font-semibold"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
          
          <p className="text-primary-200 text-sm mt-6">
            Free forever • No credit card required • 5-minute setup
          </p>
        </div>
      </section>

      </div>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseModal}
        initialMode={authMode}
      />
    </div>
  );
};

export default LandingPage;