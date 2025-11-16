import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const TestAuthPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Auth Test Page
        </h1>
        
        <div className="space-y-4">
          <div>
            <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
          
          {user && (
            <div>
              <strong>User:</strong>
              <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="text-red-600 dark:text-red-400">
              User is not authenticated. Please login.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestAuthPage;