import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded">
                <Zap className="h-3 w-3 text-white" fill="white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                © {currentYear} HabitForge. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/privacy" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link 
                to="/terms" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-white transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded">
                <Zap className="h-4 w-4 text-white" fill="white" />
              </div>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">
                HabitForge
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed">
              Transform your habits with gamified tracking, AI coaching, and community support.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © {currentYear} HabitForge. All rights reserved.
            </p>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Made with ❤️ for better habits
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};