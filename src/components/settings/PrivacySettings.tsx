import React, { useState, useEffect } from 'react';
import { Eye, Download, Trash2, AlertTriangle, Lock, Key, Database, Save, CheckCircle } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

interface PrivacySettingsProps {
  className?: string;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ className }) => {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private' as 'public' | 'friends' | 'private',
    habitDataSharing: false,
    analyticsSharing: false,
    aiPersonalization: true,
    communityParticipation: false,
    dataRetention: '1year' as '6months' | '1year' | '2years' | 'indefinite',
    thirdPartySharing: false,
    marketingEmails: false
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Load user privacy settings
  useEffect(() => {
    if (user?.privacySettings) {
      setPrivacySettings({
        profileVisibility: user.privacySettings.profileVisibility ?? 'private',
        habitDataSharing: user.privacySettings.habitDataSharing ?? false,
        analyticsSharing: user.privacySettings.analyticsSharing ?? false,
        aiPersonalization: user.privacySettings.allowAIPersonalization ?? true,
        communityParticipation: user.privacySettings.shareWithCommunity ?? false,
        dataRetention: user.privacySettings.dataRetention ?? '1year',
        thirdPartySharing: user.privacySettings.thirdPartySharing ?? false,
        marketingEmails: user.privacySettings.marketingEmails ?? false
      });
    }
  }, [user]);

  const updateSetting = (key: string, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateProfile({
        privacySettings: {
          profileVisibility: privacySettings.profileVisibility,
          habitDataSharing: privacySettings.habitDataSharing,
          analyticsSharing: privacySettings.analyticsSharing,
          allowAIPersonalization: privacySettings.aiPersonalization,
          shareWithCommunity: privacySettings.communityParticipation,
          showOnLeaderboard: privacySettings.communityParticipation,
          dataRetention: privacySettings.dataRetention,
          thirdPartySharing: privacySettings.thirdPartySharing,
          marketingEmails: privacySettings.marketingEmails
        }
      });
      
      setSaveSuccess(true);
      
      // Reload the page after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save settings');
      setIsSaving(false);
    }
  };

  const handleDataExport = () => {
    // Navigate to the Analytics page Export Data tab
    window.location.href = '/analytics?tab=export';
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('habitforge-auth') ? JSON.parse(localStorage.getItem('habitforge-auth')!).state.token : ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Clear local storage and redirect to landing page
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      setSaveError('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const visibilityOptions = [
    { value: 'public', label: 'Public', description: 'Anyone can see your profile and progress' },
    { value: 'friends', label: 'Friends Only', description: 'Only people you connect with can see your data' },
    { value: 'private', label: 'Private', description: 'Only you can see your data' }
  ];

  const retentionOptions = [
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
    { value: '2years', label: '2 Years' },
    { value: 'indefinite', label: 'Indefinite' }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
          <p className="text-success-700 dark:text-success-300">Privacy settings saved successfully!</p>
        </div>
      )}
      
      {saveError && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-error-600 dark:text-error-400" />
          <p className="text-error-700 dark:text-error-300">{saveError}</p>
        </div>
      )}

      {/* Profile Visibility */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Profile Visibility
        </h3>

        <div className="space-y-4">
          {visibilityOptions.map((option) => {
            const isSelected = privacySettings.profileVisibility === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all',
                  !isSelected && 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
                style={isSelected ? {
                  backgroundColor: 'var(--color-primary-900)',
                  borderColor: 'var(--color-primary-700)'
                } : undefined}
              >
                <input
                  type="radio"
                  name="profileVisibility"
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => updateSetting('profileVisibility', e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div 
                    className="font-medium"
                    style={isSelected ? { color: 'var(--color-primary-300)' } : undefined}
                  >
                    {option.label}
                  </div>
                  <div 
                    className="text-sm"
                    style={isSelected ? { color: 'var(--color-primary-400)' } : undefined}
                  >
                    {option.description}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      {/* Data Sharing */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Sharing & Privacy
        </h3>

        <div className="space-y-6">
          {/* Habit Data Sharing */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                Share Habit Data for Research
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Allow anonymized habit data to be used for research to improve the platform
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.habitDataSharing}
              onChange={(e) => updateSetting('habitDataSharing', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            />
          </div>

          {/* Analytics Sharing */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                Share Analytics Data
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Help improve the app by sharing usage analytics and performance data
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.analyticsSharing}
              onChange={(e) => updateSetting('analyticsSharing', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            />
          </div>

          {/* AI Personalization */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                AI Personalization
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Use your data to provide personalized AI coaching and recommendations
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.aiPersonalization}
              onChange={(e) => updateSetting('aiPersonalization', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            />
          </div>

          {/* Community Participation */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                Community Features
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Participate in community challenges and leaderboards
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.communityParticipation}
              onChange={(e) => updateSetting('communityParticipation', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            />
          </div>

          {/* Third Party Sharing */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                Third-Party Integrations
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Allow data sharing with connected third-party apps and services
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.thirdPartySharing}
              onChange={(e) => updateSetting('thirdPartySharing', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            />
          </div>

          {/* Marketing Emails */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                Marketing Communications
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Receive promotional emails about new features and tips
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.marketingEmails}
              onChange={(e) => updateSetting('marketingEmails', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            />
          </div>
        </div>
      </Card>

      {/* Data Retention */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Data Retention
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keep my data for
            </label>
            <select
              value={privacySettings.dataRetention}
              onChange={(e) => updateSetting('dataRetention', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {retentionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Data Retention Policy</p>
                <p>
                  Your data will be automatically deleted after the selected period of inactivity. 
                  You can always export your data before deletion or change this setting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Key className="h-5 w-5" />
          Data Management
        </h3>

        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                Export Your Data
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Download a complete copy of your data in CSV format
              </div>
            </div>
            <Button
              onClick={handleDataExport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div>
              <div className="font-medium text-red-900 dark:text-red-100 mb-1">
                Delete Account
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Permanently delete your account and all associated data
              </div>
            </div>
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          loading={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-medium mb-1">This action cannot be undone</p>
                <p>
                  Deleting your account will permanently remove all your habits, progress data, 
                  and personal information. This action cannot be reversed.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type "DELETE" to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAccountDeletion}
                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
 