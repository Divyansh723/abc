import React, { useState, useEffect } from 'react';
import { User, Calendar, MapPin, Save, Edit, Camera, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, ModalContent, ModalFooter } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import { COMMON_TIMEZONES } from '@/utils/timezoneUtils';

interface ProfileSettingsProps {
  className?: string;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ className }) => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    timezone: 'UTC',
    avatar: ''
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        timezone: user.timezone || 'UTC',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const timezoneOptions = COMMON_TIMEZONES.map(tz => ({
    value: tz.value,
    label: tz.label
  }));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Reload the page after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to update profile');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        timezone: user.timezone || 'UTC',
        avatar: user.avatar || ''
      });
    }
    setSaveError(null);
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server or cloud storage
      // For now, we'll use a data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
          <p className="text-success-700 dark:text-success-300">Profile updated successfully!</p>
        </div>
      )}
      
      {saveError && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-error-600 dark:text-error-400" />
          <p className="text-error-700 dark:text-error-300">{saveError}</p>
        </div>
      )}

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            {formData.avatar ? (
              <img 
                src={formData.avatar} 
                alt={user?.name || 'User'} 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors cursor-pointer">
                <Camera className="h-4 w-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                />
              </label>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name || 'User'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 break-all overflow-wrap-anywhere">
                  {user?.email}
                </p>
              </div>
              
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{timezoneOptions.find(tz => tz.value === formData.timezone)?.label || 'UTC'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Password Change Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Security
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-900 dark:text-white font-medium">Password</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Change your password to keep your account secure
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
        </div>
      </Card>

      {/* Profile Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                {formData.name || 'Not set'}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white break-words overflow-hidden">
                <span className="block break-all">{formData.email || 'Not set'}</span>
              </div>
              <Badge variant="outline" size="sm" className="text-green-600 border-green-600 flex-shrink-0">
                Verified
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            {isEditing ? (
              <Select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                options={timezoneOptions}
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
                {timezoneOptions.find(tz => tz.value === formData.timezone)?.label || 'UTC'}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordError(null);
          setPasswordSuccess(false);
        }}
        title="Change Password"
        size="md"
      >
        <ModalContent>
          <div className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-error-600 dark:text-error-400" />
                <p className="text-sm text-error-700 dark:text-error-300">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />
                <p className="text-sm text-success-700 dark:text-success-300">Password changed successfully!</p>
              </div>
            )}

            <Input
              type="password"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Enter your current password"
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Input
              type="password"
              label="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Enter your new password (min 6 characters)"
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Input
              type="password"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm your new password"
              leftIcon={<Lock className="h-4 w-4" />}
            />
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setPasswordError(null);
            }}
            disabled={isChangingPassword}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePasswordChange}
            loading={isChangingPassword}
          >
            Change Password
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};