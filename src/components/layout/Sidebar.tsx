import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  Heart, 
  BarChart3, 
  Brain,
  Settings,
  Zap,
  Trophy,
  User,
  LogOut,
  X,
  Bell
} from 'lucide-react';
import { Button, ThemeToggle, Badge } from '@/components/ui';
import { AuthModal } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { useCommunityAccess } from '@/hooks/useCommunityAccess';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose,
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalXP, currentLevel, forgivenessTokens } = useGamification();
  const { canAccessCommunity } = useCommunityAccess();
  const { unreadCount } = useNotifications();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Overview and daily habits'
    },
    { 
      name: 'Goals', 
      href: '/goals', 
      icon: Target,
      description: 'Habits and challenges'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
      description: 'Progress and statistics'
    },
    { 
      name: 'AI Insights', 
      href: '/insights', 
      icon: Brain,
      description: 'AI-powered habit insights'
    },
    { 
      name: 'Wellbeing', 
      href: '/wellbeing', 
      icon: Heart,
      description: 'Mental health insights'
    },
    { 
      name: 'Community', 
      href: '/community', 
      icon: Trophy,
      description: 'Join circles and compete'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'Account and preferences'
    },
  ];

  const quickStats = [
    { label: 'Current Level', value: currentLevel.toString(), icon: Zap },
    { label: 'Total XP', value: totalXP.toString(), icon: Trophy },
    { label: 'Forgiveness Tokens', value: forgivenessTokens.toString(), icon: Heart },
  ];

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:h-screen',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header with Logo and Close Button */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
            <Link 
              to={isAuthenticated ? '/dashboard' : '/'}
              className="flex items-center gap-2"
              onClick={onClose}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                HabitForge
              </span>
            </Link>
            
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Profile Section */}
          {isAuthenticated ? (
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeToggle size="sm" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="relative"
                  >
                    <User className="h-4 w-4" />
                    {/* Unread notification badge on user icon */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <Link
                    to="/notifications"
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => {
                      setShowUserMenu(false);
                      onClose?.();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications
                    </div>
                    {unreadCount > 0 && (
                      <Badge 
                        variant="primary" 
                        className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => {
                      setShowUserMenu(false);
                      onClose?.();
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <ThemeToggle size="sm" />
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenAuth('login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleOpenAuth('register')}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation
                .filter((item) => {
                  // Hide Community link if user has disabled community features
                  if (item.name === 'Community' && !canAccessCommunity) {
                    return false;
                  }
                  return true;
                })
                .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                      active
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Icon className={cn(
                      'h-5 w-5 transition-colors',
                      active 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    )} />
                    <div className="flex-1">
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Quick Stats */}
          {isAuthenticated && (
            <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                {quickStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};