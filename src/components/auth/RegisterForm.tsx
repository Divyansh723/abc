import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input, Card, Checkbox } from '@/components/ui';
import { userRegistrationSchema, type UserRegistrationData } from '@/utils/validationUtils';

interface RegisterFormProps {
  onSubmit: (data: UserRegistrationData) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onSwitchToLogin,
  isLoading = false,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserRegistrationData>({
    resolver: zodResolver(userRegistrationSchema),
  });

  const password = watch('password');
  
  // Password strength indicators
  const passwordStrength = {
    hasLength: password?.length >= 8,
    hasLower: /[a-z]/.test(password || ''),
    hasUpper: /[A-Z]/.test(password || ''),
    hasNumber: /\d/.test(password || ''),
  };

  const passwordStrengthScore = Object.values(passwordStrength).filter(Boolean).length;

  const handleFormSubmit = async (data: UserRegistrationData) => {
    if (!acceptTerms) {
      setSubmitError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto" padding="lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create Account
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start your habit transformation journey today
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {submitError && (
          <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-error-600 dark:text-error-400 flex-shrink-0" />
            <p className="text-sm text-error-700 dark:text-error-300">{submitError}</p>
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-2">
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          
          {password && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < passwordStrengthScore
                        ? passwordStrengthScore <= 2
                          ? 'bg-error-500'
                          : passwordStrengthScore === 3
                          ? 'bg-warning-500'
                          : 'bg-success-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              
              <div className="text-xs space-y-1">
                {Object.entries({
                  'At least 8 characters': passwordStrength.hasLength,
                  'One lowercase letter': passwordStrength.hasLower,
                  'One uppercase letter': passwordStrength.hasUpper,
                  'One number': passwordStrength.hasNumber,
                }).map(([requirement, met]) => (
                  <div key={requirement} className="flex items-center gap-2">
                    <CheckCircle
                      className={`h-3 w-3 ${
                        met ? 'text-success-500' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                    <span
                      className={`${
                        met ? 'text-success-600 dark:text-success-400' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {requirement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Checkbox
          label="I accept the Terms of Service and Privacy Policy"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          description="By creating an account, you agree to our terms and privacy policy."
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting || isLoading}
          disabled={!acceptTerms}
        >
          Create Account
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Or sign up with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          <Button variant="outline" className="w-full">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            Sign in
          </button>
        </p>
      </form>
    </Card>
  );
};