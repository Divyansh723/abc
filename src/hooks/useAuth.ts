import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { type UserLoginData, type UserRegistrationData } from '@/utils/validationUtils';
import { type User } from '@/types/user';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    setAuth,
    clearAuth,
    setLoading,
    updateUser,
  } = useAuthStore();

  const login = useCallback(async (credentials: UserLoginData) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setAuth(response.user, response.token, response.refreshToken);
      return response.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [setAuth, setLoading]);

  const register = useCallback(async (userData: UserRegistrationData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      setAuth(response.user, response.token, response.refreshToken);
      return response.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [setAuth, setLoading]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      clearAuth();
    }
  }, [clearAuth, setLoading]);

  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated) return null;
    
    try {
      const userData = await authService.getCurrentUser();
      updateUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails due to auth issues, clear auth
      if (error instanceof Error && error.message.includes('401')) {
        clearAuth();
      }
      throw error;
    }
  }, [isAuthenticated, updateUser, clearAuth]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    
    try {
      const updatedUser = await authService.updateProfile(updates);
      updateUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }, [isAuthenticated, updateUser]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    
    try {
      await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  }, [isAuthenticated]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      await authService.requestPasswordReset(email);
    } catch (error) {
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      await authService.resetPassword(token, newPassword);
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    
    // Actions
    login,
    register,
    logout,
    refreshUserData,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
  };
};