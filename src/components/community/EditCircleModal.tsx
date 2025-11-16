import React, { useState, useEffect } from 'react';
import { Button, Input, Modal } from '@/components/ui';
import communityService from '@/services/communityService';

interface EditCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  currentName: string;
  currentDescription?: string;
  onSuccess?: () => void;
}

export const EditCircleModal: React.FC<EditCircleModalProps> = ({
  isOpen,
  onClose,
  circleId,
  currentName,
  currentDescription,
  onSuccess
}) => {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when props change
  useEffect(() => {
    setName(currentName);
    setDescription(currentDescription || '');
  }, [currentName, currentDescription, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 3) {
      setError('Circle name must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      await communityService.updateCircle(circleId, {
        name: name.trim(),
        description: description.trim() || undefined
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update circle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Circle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Circle Name *
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter circle name"
            maxLength={50}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {name.length}/50 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your circle (optional)"
            maxLength={200}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description.length}/200 characters
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
