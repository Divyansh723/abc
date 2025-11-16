import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button, Input, Card, Textarea, Checkbox } from '@/components/ui';
import communityService from '@/services/communityService';
import { CircleAnnouncement } from '@/types/community';

interface CreateAnnouncementModalProps {
  circleId: string;
  announcement?: CircleAnnouncement; // Optional: for editing
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  circleId,
  announcement,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setIsImportant(announcement.isImportant);
    }
  }, [announcement]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (title.length > 100) {
      setError('Title must be 100 characters or less');
      return;
    }

    if (content.length > 1000) {
      setError('Content must be 1000 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (announcement) {
        // Update existing announcement
        await communityService.updateAnnouncement(circleId, announcement._id, {
          title: title.trim(),
          content: content.trim(),
          isImportant
        });
      } else {
        // Create new announcement
        await communityService.createAnnouncement(circleId, {
          title: title.trim(),
          content: content.trim(),
          isImportant
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to ${announcement ? 'update' : 'create'} announcement`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {announcement ? '✏️ Edit Announcement' : '📢 Create Announcement'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {announcement ? 'Update your announcement' : 'Share important updates with circle members'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title..."
                maxLength={100}
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {title.length}/100 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement content..."
                rows={4}
                maxLength={1000}
                className="w-full resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {content.length}/1000 characters
              </p>
            </div>

            {/* Important Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="important"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
              />
              <label 
                htmlFor="important" 
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Mark as important
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {isSubmitting 
                  ? (announcement ? 'Updating...' : 'Creating...') 
                  : (announcement ? 'Update Announcement' : 'Create Announcement')
                }
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
