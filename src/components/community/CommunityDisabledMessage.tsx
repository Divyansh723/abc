import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Settings } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export const CommunityDisabledMessage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
          <Lock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Community Features Disabled
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You've disabled community features in your privacy settings. 
          Enable them to join circles, participate in challenges, and connect with others.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/settings/privacy')}
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            Update Privacy Settings
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Privacy First:</strong> Your data is always under your control. 
            You can enable or disable community features at any time.
          </p>
        </div>
      </Card>
    </div>
  );
};
