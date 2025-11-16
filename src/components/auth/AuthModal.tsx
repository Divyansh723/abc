import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { type UserLoginData, type UserRegistrationData } from '@/utils/validationUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  redirectTo?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  redirectTo = '/dashboard',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  // Sync mode with initialMode when it changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  const handleLogin = async (data: UserLoginData) => {
    try {
      await login(data);
      onClose();
      navigate(redirectTo);
    } catch (error) {
      // Error is handled by the form component
      throw error;
    }
  };

  const handleRegister = async (data: UserRegistrationData) => {
    try {
      await register(data);
      onClose();
      navigate(redirectTo);
    } catch (error) {
      // Error is handled by the form component
      throw error;
    }
  };

  const switchToRegister = () => setMode('register');
  const switchToLogin = () => setMode('login');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      title={mode === 'login' ? 'Sign In' : 'Sign Up'}
    >
      <div className="space-y-4">
        {mode === 'login' ? (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToRegister={switchToRegister}
            isLoading={isLoading}
          />
        ) : (
          <RegisterForm
            onSubmit={handleRegister}
            onSwitchToLogin={switchToLogin}
            isLoading={isLoading}
          />
        )}
      </div>
    </Modal>
  );
};