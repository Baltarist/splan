import api, { ApiResponse, handleApiError } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    name?: string;
  };
  token: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
}

// Auth Service
class AuthService {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        
        // Store token and user data
        await AsyncStorage.setItem('authToken', authData.token);
        await AsyncStorage.setItem('user', JSON.stringify(authData.user));
        
        return authData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Login failed');
    }
  }

  // Register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        
        // Store token and user data
        await AsyncStorage.setItem('authToken', authData.token);
        await AsyncStorage.setItem('user', JSON.stringify(authData.user));
        
        return authData;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Registration failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed, continuing with local logout');
    } finally {
      // Clear local storage
      await AsyncStorage.multiRemove(['authToken', 'user']);
    }
  }

  // Get stored user
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // Get stored token
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Refresh token (if needed)
  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
      
      if (response.data.success && response.data.data) {
        const newToken = response.data.data.token;
        await AsyncStorage.setItem('authToken', newToken);
        return newToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }
}

export default new AuthService(); 