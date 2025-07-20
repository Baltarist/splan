import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// eslint-disable-next-line no-undef
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1' 
  : 'https://your-production-api.com/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && originalRequest) {
      try {
        // Clear stored token
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        
        // You can dispatch logout action here if needed
        // dispatch(logout());
        
        return Promise.reject(error);
      } catch (storageError) {
        console.error('Error clearing auth data:', storageError);
      }
    }

    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error handling utility
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
    return (error.response.data as { message: string }).message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

export default api; 