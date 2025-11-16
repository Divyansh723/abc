import React from 'react';
import { Sparkles, Star, Circle, Zap, Trophy, Target, Heart } from 'lucide-react';

interface FloatingElementsProps {
  variant?: 'default' | 'pricing' | 'features' | 'about' | 'contact' | 'blog' | 'terms' | 'privacy';
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({ variant = 'default' }) => {
  const getElements = () => {
    switch (variant) {
      case 'pricing':
        return (
          <>
            <div className="absolute top-20 left-10 text-yellow-400/20 dark:text-yellow-400/10 animate-float-slow">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="absolute top-40 right-20 text-blue-400/20 dark:text-blue-400/10 animate-float">
              <Star className="w-16 h-16" />
            </div>
            <div className="absolute bottom-40 left-20 text-purple-400/20 dark:text-purple-400/10 animate-float-reverse">
              <Circle className="w-20 h-20" />
            </div>
            <div className="absolute bottom-20 right-40 text-green-400/20 dark:text-green-400/10 animate-spin-slow">
              <Zap className="w-14 h-14" />
            </div>
          </>
        );
      case 'features':
        return (
          <>
            <div className="absolute top-32 left-16 text-cyan-400/20 dark:text-cyan-400/10 animate-float">
              <Target className="w-16 h-16" />
            </div>
            <div className="absolute top-60 right-24 text-pink-400/20 dark:text-pink-400/10 animate-float-slow">
              <Star className="w-12 h-12" />
            </div>
            <div className="absolute bottom-32 left-32 text-indigo-400/20 dark:text-indigo-400/10 animate-float-reverse">
              <Sparkles className="w-14 h-14" />
            </div>
            <div className="absolute bottom-60 right-16 text-orange-400/20 dark:text-orange-400/10 animate-spin-slow">
              <Circle className="w-18 h-18" />
            </div>
          </>
        );
      case 'about':
        return (
          <>
            <div className="absolute top-24 left-12 text-blue-400/20 dark:text-blue-400/10 animate-float-slow">
              <Heart className="w-14 h-14" />
            </div>
            <div className="absolute top-48 right-16 text-purple-400/20 dark:text-purple-400/10 animate-float">
              <Trophy className="w-16 h-16" />
            </div>
            <div className="absolute bottom-48 left-24 text-green-400/20 dark:text-green-400/10 animate-float-reverse">
              <Star className="w-12 h-12" />
            </div>
            <div className="absolute bottom-24 right-32 text-yellow-400/20 dark:text-yellow-400/10 animate-spin-slow">
              <Sparkles className="w-16 h-16" />
            </div>
          </>
        );
      case 'contact':
        return (
          <>
            <div className="absolute top-28 left-20 text-teal-400/20 dark:text-teal-400/10 animate-float">
              <Circle className="w-14 h-14" />
            </div>
            <div className="absolute top-52 right-28 text-rose-400/20 dark:text-rose-400/10 animate-float-slow">
              <Sparkles className="w-16 h-16" />
            </div>
            <div className="absolute bottom-36 left-16 text-violet-400/20 dark:text-violet-400/10 animate-float-reverse">
              <Star className="w-12 h-12" />
            </div>
            <div className="absolute bottom-52 right-20 text-amber-400/20 dark:text-amber-400/10 animate-spin-slow">
              <Zap className="w-14 h-14" />
            </div>
          </>
        );
      case 'blog':
        return (
          <>
            <div className="absolute top-36 left-24 text-indigo-400/20 dark:text-indigo-400/10 animate-float-slow">
              <Star className="w-14 h-14" />
            </div>
            <div className="absolute top-56 right-32 text-pink-400/20 dark:text-pink-400/10 animate-float">
              <Circle className="w-16 h-16" />
            </div>
            <div className="absolute bottom-44 left-28 text-cyan-400/20 dark:text-cyan-400/10 animate-float-reverse">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="absolute bottom-28 right-24 text-lime-400/20 dark:text-lime-400/10 animate-spin-slow">
              <Target className="w-16 h-16" />
            </div>
          </>
        );
      case 'terms':
        return (
          <>
            <div className="absolute top-32 left-16 text-blue-400/20 dark:text-blue-400/10 animate-float">
              <Circle className="w-14 h-14" />
            </div>
            <div className="absolute top-56 right-20 text-purple-400/20 dark:text-purple-400/10 animate-float-slow">
              <Star className="w-12 h-12" />
            </div>
            <div className="absolute bottom-40 left-20 text-green-400/20 dark:text-green-400/10 animate-float-reverse">
              <Sparkles className="w-16 h-16" />
            </div>
            <div className="absolute bottom-32 right-28 text-orange-400/20 dark:text-orange-400/10 animate-spin-slow">
              <Zap className="w-14 h-14" />
            </div>
          </>
        );
      case 'privacy':
        return (
          <>
            <div className="absolute top-28 left-20 text-cyan-400/20 dark:text-cyan-400/10 animate-float-slow">
              <Star className="w-16 h-16" />
            </div>
            <div className="absolute top-48 right-24 text-indigo-400/20 dark:text-indigo-400/10 animate-float">
              <Circle className="w-14 h-14" />
            </div>
            <div className="absolute bottom-36 left-24 text-pink-400/20 dark:text-pink-400/10 animate-float-reverse">
              <Sparkles className="w-14 h-14" />
            </div>
            <div className="absolute bottom-48 right-20 text-teal-400/20 dark:text-teal-400/10 animate-spin-slow">
              <Heart className="w-12 h-12" />
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="absolute top-24 left-16 text-primary-400/20 dark:text-primary-400/10 animate-float">
              <Star className="w-14 h-14" />
            </div>
            <div className="absolute top-48 right-20 text-secondary-400/20 dark:text-secondary-400/10 animate-float-slow">
              <Circle className="w-16 h-16" />
            </div>
            <div className="absolute bottom-40 left-24 text-primary-400/20 dark:text-primary-400/10 animate-float-reverse">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="absolute bottom-24 right-28 text-secondary-400/20 dark:text-secondary-400/10 animate-spin-slow">
              <Zap className="w-14 h-14" />
            </div>
          </>
        );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {getElements()}
    </div>
  );
};
