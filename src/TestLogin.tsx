import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const TestLogin: React.FC = () => {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated:', user);
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleTestLogin = async () => {
    try {
      setError(null);
      console.log('Attempting test login...');
      await login({
        email: 'demo@habitforge.com',
        password: 'password'
      });
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Test Login
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
          
          {error && (
            <div className="text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded">
              Error: {error}
            </div>
          )}
          
          <button
            onClick={handleTestLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Test Login (Mock)'}
          </button>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            This will attempt to login with mock credentials:
            <br />
            Email: demo@habitforge.com
            <br />
            Password: password
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLogin;