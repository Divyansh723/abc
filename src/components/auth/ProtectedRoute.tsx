import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/',
}) => {
  const { isAuthenticated, isLoading, refreshUserData } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Try to refresh user data on mount if we have a token
    if (isAuthenticated && !isLoading) {
      refreshUserData().catch(() => {
        // If refresh fails, user will be logged out automatically
      });
    }
  }, [isAuthenticated, isLoading, refreshUserData]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};