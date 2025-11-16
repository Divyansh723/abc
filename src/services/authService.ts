import axios from 'axios';
import { type User } from '@/types/user';
import { type UserLoginData, type UserRegistrationData } from '@/utils/validationUtils';
import { mockAuthService } from './mockAuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK_API = import.meta.env.VITE_MOCK_API === 'true';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

class AuthService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getStoredRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              this.setStoredTokens(response.token, response.refreshToken);
              originalRequest.headers.Authorization = `Bearer ${response.token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear auth and redirect to login
            this.clearStoredTokens();
            window.location.href = '/';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(credentials: UserLoginData): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      return await mockAuthService.login(credentials);
    }

    try {
      const response = await this.api.post('/auth/login', credentials);
      
      // Backend returns { success: true, data: { user, token, refreshToken } }
      // Frontend expects { user, token, refreshToken }
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async register(userData: UserRegistrationData): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      return await mockAuthService.register(userData);
    }

    try {
      const response = await this.api.post('/auth/register', userData);
      
      // Backend returns { success: true, data: { user, token, refreshToken } }
      // Frontend expects { user, token, refreshToken }
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async logout(): Promise<void> {
    if (USE_MOCK_API) {
      await mockAuthService.logout();
      this.clearStoredTokens();
      return;
    }

    try {
      const refreshToken = this.getStoredRefreshToken();
      if (refreshToken) {
        await this.api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Ignore logout errors, still clear local tokens
      console.warn('Logout request failed:', error);
    } finally {
      this.clearStoredTokens();
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await this.api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_API) {
      const token = this.getStoredToken();
      if (!token) throw new Error('No token available');
      return await mockAuthService.getCurrentUser(token);
    }

    const response = await this.api.get('/auth/me');
    
    // Backend returns { success: true, data: { user } }
    // Frontend expects just the user object
    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }
    
    return response.data;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await this.api.patch<User>('/auth/profile', updates);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.api.post('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  // Token management helpers
  private getStoredToken(): string | null {
    try {
      const authData = localStorage.getItem('habitforge-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.warn('Failed to get stored token:', error);
    }
    return null;
  }

  private getStoredRefreshToken(): string | null {
    try {
      const authData = localStorage.getItem('habitforge-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.refreshToken || null;
      }
    } catch (error) {
      console.warn('Failed to get stored refresh token:', error);
    }
    return null;
  }

  private setStoredTokens(token: string, refreshToken: string): void {
    try {
      const authData = localStorage.getItem('habitforge-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        parsed.state.token = token;
        parsed.state.refreshToken = refreshToken;
        localStorage.setItem('habitforge-auth', JSON.stringify(parsed));
      }
    } catch (error) {
      console.warn('Failed to set stored tokens:', error);
    }
  }

  private clearStoredTokens(): void {
    try {
      localStorage.removeItem('habitforge-auth');
    } catch (error) {
      console.warn('Failed to clear stored tokens:', error);
    }
  }
}

export const authService = new AuthService();