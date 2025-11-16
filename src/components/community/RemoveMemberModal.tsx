import React, { useState } from 'react';
import { AlertTriangle, UserMinus } from 'lucide-react';
import { Modal, Button, Textarea } from '@/components/ui';

interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  memberName: string;
  circleName: string;
}

export const RemoveMemberModal: React.FC<RemoveMemberModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  circleName
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for removing this member');
      return;
    }

    if (reason.length > 500) {
      setError('Reason must be less than 500 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onConfirm(reason);
      setReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <UserMinus className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Remove Member
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You are about to remove <span className="font-semibold">{memberName}</span> from{' '}
              <span className="font-semibold">{circleName}</span>
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold mb-1">This action cannot be undone</p>
            <p>The member will be notified with your reason and will need to rejoin if they want to return.</p>
          </div>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason for Removal <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a clear reason for removing this member (e.g., violation of community guidelines, inappropriate behavior, etc.)"
            rows={4}
            maxLength={500}
            className="w-full"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This reason will be sent to the member as a notification
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {reason.length}/500
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Removing...' : 'Remove Member'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
