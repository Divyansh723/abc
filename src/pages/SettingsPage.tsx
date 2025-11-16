import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import { Card, Button, ThemeToggle } from '@/components/ui';
import { ProfileSettings, NotificationSettings, PrivacySettings, AccentColorPicker } from '@/components/settings';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

type SettingsTab = 'profile' | 'notifications' | 'privacy' | 'appearance' | 'preferences';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const settingsTabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Personal information and account details'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Manage how and when you receive notifications'
    },
    {
      id: 'privacy',
      label: 'Privacy & Data',
      icon: Shield,
      description: 'Control your privacy settings and data usage'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel of the app'
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: Globe,
      description: 'Language, timezone, and other preferences'
    }
  ];

  const handleSaveAll = () => {
    // This would save all pending changes
    console.log('Saving all settings...');
    setHasUnsavedChanges(false);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
              Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Manage your account, preferences, and privacy settings
            </p>
          </div>

          {hasUnsavedChanges && (
            <Button
              onClick={handleSaveAll}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="p-3 sm:p-4">
              <nav className="space-y-1 sm:space-y-2">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as SettingsTab)}
                      className={cn(
                        'w-full flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg text-left transition-all',
                        isActive
                          ? 'border'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                      style={isActive ? {
                        backgroundColor: 'var(--color-primary-900)',
                        borderColor: 'var(--color-primary-700)',
                        color: 'var(--color-primary-300)'
                      } : undefined}
                    >
                      <Icon 
                        className={cn(
                          'h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5',
                          !isActive && 'text-gray-500'
                        )}
                        style={isActive ? { color: 'var(--color-primary-600)' } : undefined}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm sm:text-base font-medium">
                          {tab.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </Card>

            {/* User Info Card */}
            <Card className="p-3 sm:p-4 mt-4 sm:mt-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {activeTab === 'profile' && (
              <ProfileSettings />
            )}

            {activeTab === 'notifications' && (
              <NotificationSettings />
            )}

            {activeTab === 'privacy' && (
              <PrivacySettings />
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance Settings
                  </h3>

                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Theme
                      </label>
                      <div className="flex items-center gap-4">
                        <ThemeToggle variant="dropdown" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Choose between light or dark theme
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Accent Color Picker */}
                <AccentColorPicker />
              </div>
            )}

            {activeTab === 'preferences' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Preferences
                </h3>

                <div className="space-y-6">
                  {/* Week Start */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Week Starts On
                    </label>
                    <select className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                  </div>

                  {/* Default Habit Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Habit Duration
                    </label>
                    <select className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="21">21 days</option>
                      <option value="30">30 days</option>
                      <option value="66">66 days</option>
                      <option value="90">90 days</option>
                      <option value="indefinite">Indefinite</option>
                    </select>
                  </div>

                  {/* Auto-backup */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Automatic Backup
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically backup your data weekly
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;