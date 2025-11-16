import React from 'react';
import { Lock, Settings } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

interface AIDisabledMessageProps {
  title?: string;
  message?: string;
  className?: string;
}

export const AIDisabledMessage: React.FC<AIDisabledMessageProps> = ({
  title = 'AI Features Disabled',
  message = 'AI personalization is currently disabled in your privacy settings. Enable it to access personalized insights, coaching, and recommendations.',
  className = ''
}) => {
  const navigate = useNavigate();

  return (
    <Card className={`p-8 text-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          <Lock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {message}
          </p>
        </div>

        <Button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 mt-2"
        >
          <Settings className="h-4 w-4" />
          Go to Privacy Settings
        </Button>

        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Your privacy is important. You can enable or disable AI features anytime.
        </p>
      </div>
    </Card>
  );
};
