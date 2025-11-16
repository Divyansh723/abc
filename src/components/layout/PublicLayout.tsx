import React from 'react';
import { Footer } from './Footer';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Enhanced Header with Backdrop Blur */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <Zap className="h-6 w-6 text-white" fill="white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                HabitForge
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                to="/dashboard"
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Go to App
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Enhanced Background */}
      <main className="flex-1 relative">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/20 dark:bg-primary-900/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-200/20 dark:bg-secondary-900/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer variant="default" />
    </div>
  );
};
