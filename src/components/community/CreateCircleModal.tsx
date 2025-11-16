import React, { useState } from 'react';
import { Users, Lock, Unlock, Copy, Check } from 'lucide-react';
import { Modal, Button, Input, Textarea } from '@/components/ui';
import { useCommunity } from '@/hooks/useCommunity';
import { cn } from '@/utils/cn';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createCircle, loading } = useCommunity();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 10,
    isPrivate: false
  });
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await createCircle(formData);
      if (result.inviteCode) {
        setInviteCode(result.inviteCode);
      } else {
        onClose();
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create circle');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      maxMembers: 10,
      isPrivate: false
    });
    setInviteCode(null);
    setCopied(false);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Community Circle">
      {!inviteCode ? (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          {/* Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Circle Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Runners"
              required
              minLength={3}
              maxLength={50}
              className="text-sm sm:text-base"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this circle about?"
              rows={3}
              maxLength={200}
              className="text-sm sm:text-base"
            />
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Members
            </label>
            <Input
              type="number"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              min={2}
              max={50}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Between 2 and 50 members
            </p>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              {formData.isPrivate ? (
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Unlock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.isPrivate ? 'Private Circle' : 'Public Circle'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formData.isPrivate
                    ? 'Requires invite code to join'
                    : 'Anyone can discover and join'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                formData.isPrivate ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Circle'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Circle Created!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Share this invite code with others to join your private circle
          </p>
          
          <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
            <code className="flex-1 text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">
              {inviteCode}
            </code>
            <Button
              variant="secondary"
              size="sm"
              onClick={copyInviteCode}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
};
