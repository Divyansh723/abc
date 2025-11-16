import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Clock, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

interface NotificationSettingsProps {
  className?: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className }) => {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState({
    habitReminders: true,
    streakMilestones: true,
    dailySummary: true,
    weeklyInsights: true,
    challengeUpdates: true,
    communityActivity: false,
    systemUpdates: true,
    tipsAndTricks: false,
    autoForgiveness: true
  });

  const [globalSettings, setGlobalSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    inAppEnabled: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  });

  // Load user notification preferences
  useEffect(() => {
    if (user?.notificationPreferences) {
      const prefs = user.notificationPreferences;
      setPreferences({
        habitReminders: prefs.habitReminders ?? true,
        streakMilestones: prefs.streakMilestones ?? true,
        dailySummary: prefs.dailySummary ?? true,
        weeklyInsights: prefs.weeklyInsights ?? true,
        challengeUpdates: prefs.challengeUpdates ?? true,
        communityActivity: prefs.communityActivity ?? false,
        systemUpdates: prefs.systemUpdates ?? true,
        tipsAndTricks: prefs.tipsAndTricks ?? false,
        autoForgiveness: prefs.autoForgiveness ?? true
      });

      setGlobalSettings({
        pushEnabled: prefs.push ?? true,
        emailEnabled: prefs.email ?? true,
        inAppEnabled: prefs.inApp ?? true,
        quietHours: prefs.quietHours ?? {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      });
    }
  }, [user]);

  const updatePreference = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const updateGlobalSetting = (key: string, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateProfile({
        notificationPreferences: {
          push: globalSettings.pushEnabled,
          email: globalSettings.emailEnabled,
          inApp: globalSettings.inAppEnabled,
          reminderTime: user?.notificationPreferences?.reminderTime,
          habitReminders: preferences.habitReminders,
          streakMilestones: preferences.streakMilestones,
          dailySummary: preferences.dailySummary,
          weeklyInsights: preferences.weeklyInsights,
          challengeUpdates: preferences.challengeUpdates,
          communityActivity: preferences.communityActivity,
          systemUpdates: preferences.systemUpdates,
          tipsAndTricks: preferences.tipsAndTricks,
          autoForgiveness: preferences.autoForgiveness,
          quietHours: globalSettings.quietHours
        }
      });

      setSaveSuccess(true);
      
      // Reload the page after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save settings');
      setIsSaving(false);
    }
  };

  const notificationTypes = [
    {
      id: 'habitReminders',
      title: 'Habit Reminders',
      description: 'Get notified when it\'s time to complete your habits',
      category: 'habits',
      icon: '🎯',
      color: 'pink'
    },
    {
      id: 'streakMilestones',
      title: 'Streak Milestones',
      description: 'Celebrate when you reach streak milestones (7, 14, 30 days)',
      category: 'habits',
      icon: '🔥',
      color: 'orange'
    },
    {
      id: 'dailySummary',
      title: 'Daily Summary',
      description: 'End-of-day summary of your habit completions and progress',
      category: 'habits',
      icon: '📊',
      color: 'blue'
    },
    {
      id: 'weeklyInsights',
      title: 'Weekly Insights',
      description: 'Weekly analytics and insights about your habit patterns',
      category: 'habits',
      icon: '📈',
      color: 'gray'
    },
    {
      id: 'challengeUpdates',
      title: 'Challenge Updates',
      description: 'Updates about challenges you\'re participating in',
      category: 'social',
      icon: '🏆',
      color: 'orange'
    },
    {
      id: 'communityActivity',
      title: 'Community Activity',
      description: 'Activity from your community circles and friends',
      category: 'social',
      icon: '👥',
      color: 'purple'
    },
    {
      id: 'systemUpdates',
      title: 'System Updates',
      description: 'Important updates about HabitForge features and maintenance',
      category: 'system',
      icon: '⚙️',
      color: 'gray'
    },
    {
      id: 'tipsAndTricks',
      title: 'Tips & Tricks',
      description: 'Helpful tips to improve your habit-building journey',
      category: 'marketing',
      icon: '💡',
      color: 'yellow'
    },
    {
      id: 'autoForgiveness',
      title: 'Auto-Forgiveness Tokens',
      description: 'Automatically use forgiveness tokens at end of day to protect your streaks',
      category: 'habits',
      icon: '🛡️',
      color: 'yellow'
    }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
          <p className="text-success-700 dark:text-success-300">Notification settings saved successfully!</p>
        </div>
      )}
      
      {saveError && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-error-600 dark:text-error-400" />
          <p className="text-error-700 dark:text-error-300">{saveError}</p>
        </div>
      )}

      {/* Global Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-600" />
          Notification Channels
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Push Notifications */}
          <div className={cn(
            "relative p-5 rounded-xl border-2 transition-all cursor-pointer group",
            globalSettings.pushEnabled
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          )}
          onClick={() => updateGlobalSetting('pushEnabled', !globalSettings.pushEnabled)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  "p-2.5 rounded-lg",
                  globalSettings.pushEnabled
                    ? "bg-blue-100 dark:bg-blue-800/50"
                    : "bg-gray-100 dark:bg-gray-700"
                )}>
                  <Smartphone className={cn(
                    "h-5 w-5",
                    globalSettings.pushEnabled
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    Push Notifications
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mobile & desktop alerts
                  </div>
                </div>
              </div>
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all",
                globalSettings.pushEnabled
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              )}>
                {globalSettings.pushEnabled && (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className={cn(
            "relative p-5 rounded-xl border-2 transition-all cursor-pointer group",
            globalSettings.emailEnabled
              ? "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          )}
          onClick={() => updateGlobalSetting('emailEnabled', !globalSettings.emailEnabled)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  "p-2.5 rounded-lg",
                  globalSettings.emailEnabled
                    ? "bg-green-100 dark:bg-green-800/50"
                    : "bg-gray-100 dark:bg-gray-700"
                )}>
                  <Mail className={cn(
                    "h-5 w-5",
                    globalSettings.emailEnabled
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    Email Notifications
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Email summaries & alerts
                  </div>
                </div>
              </div>
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all",
                globalSettings.emailEnabled
                  ? "bg-green-500 border-green-500"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              )}>
                {globalSettings.emailEnabled && (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* In-App Notifications */}
          <div className={cn(
            "relative p-5 rounded-xl border-2 transition-all cursor-pointer group",
            globalSettings.inAppEnabled
              ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-600"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          )}
          onClick={() => updateGlobalSetting('inAppEnabled', !globalSettings.inAppEnabled)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  "p-2.5 rounded-lg",
                  globalSettings.inAppEnabled
                    ? "bg-purple-100 dark:bg-purple-800/50"
                    : "bg-gray-100 dark:bg-gray-700"
                )}>
                  <Bell className={cn(
                    "h-5 w-5",
                    globalSettings.inAppEnabled
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-500 dark:text-gray-400"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    In-App Notifications
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Notifications within app
                  </div>
                </div>
              </div>
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all",
                globalSettings.inAppEnabled
                  ? "bg-purple-500 border-purple-500"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              )}>
                {globalSettings.inAppEnabled && (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className={cn(
          "p-5 rounded-xl border-2 transition-all",
          globalSettings.quietHours.enabled
            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-600"
            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-lg",
                globalSettings.quietHours.enabled
                  ? "bg-indigo-100 dark:bg-indigo-800/50"
                  : "bg-gray-100 dark:bg-gray-700"
              )}>
                <Clock className={cn(
                  "h-5 w-5",
                  globalSettings.quietHours.enabled
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400"
                )} />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Quiet Hours
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pause notifications during specific hours
                </div>
              </div>
            </div>
            <div className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all cursor-pointer",
              globalSettings.quietHours.enabled
                ? "bg-indigo-500 border-indigo-500"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            )}
            onClick={() => updateGlobalSetting('quietHours', {
              ...globalSettings.quietHours,
              enabled: !globalSettings.quietHours.enabled
            })}
            >
              {globalSettings.quietHours.enabled && (
                <CheckCircle className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
          {globalSettings.quietHours.enabled && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Clock className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                <input
                  type="time"
                  value={globalSettings.quietHours.start}
                  onChange={(e) => updateGlobalSetting('quietHours', {
                    ...globalSettings.quietHours,
                    start: e.target.value
                  })}
                  className="w-full px-3 py-2 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all"
                />
              </div>
              <span className="text-gray-500 dark:text-gray-400 font-medium text-center sm:text-left flex-shrink-0">to</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Clock className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                <input
                  type="time"
                  value={globalSettings.quietHours.end}
                  onChange={(e) => updateGlobalSetting('quietHours', {
                    ...globalSettings.quietHours,
                    end: e.target.value
                  })}
                  className="w-full px-3 py-2 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Notification Preferences
        </h3>

        <div className="space-y-3">
          {notificationTypes.map((type) => {
            const isEnabled = preferences[type.id as keyof typeof preferences];
            return (
              <div 
                key={type.id} 
                className={cn(
                  "flex items-start justify-between p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-sm",
                  isEnabled 
                    ? "bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600" 
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                )}
                onClick={() => updatePreference(type.id, !isEnabled)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg text-xl",
                    isEnabled 
                      ? "bg-white dark:bg-gray-700 shadow-sm" 
                      : "bg-gray-100 dark:bg-gray-700/50"
                  )}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {type.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {type.description}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded border-2 transition-all flex-shrink-0 mt-1",
                  isEnabled
                    ? "bg-primary-600 border-primary-600"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                )}>
                  {isEnabled && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Notification Preferences'}
        </Button>
      </div>
    </div>
  );
};
