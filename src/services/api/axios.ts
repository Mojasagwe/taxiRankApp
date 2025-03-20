import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../types/auth';
import { Platform } from 'react-native';

// Get the appropriate API URL based on platform
const API_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // You might want to trigger a logout action here
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  // Register user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      console.log('Attempting registration with:', { email: userData.email });
      const response = await api.post<AuthResponse>('/auth/register', userData);
      console.log('Registration response:', response.data);
      
      if (response.data.success && response.data.data?.rider) {
        try {
          // Store user data first
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.rider));
          
          // Then store token if it exists
          if (response.data.data.token) {
            await AsyncStorage.setItem('userToken', response.data.data.token);
            console.log('Successfully stored token and user data');
          } else {
            console.warn('No token received in registration response');
          }
        } catch (storageError) {
          // Silently handle AsyncStorage errors
          console.warn('AsyncStorage error (non-critical):', storageError);
          // Don't throw or propagate the error
        }
      }
      return response.data;
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data || { success: false, error: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.success && response.data.data?.rider) {
        try {
          // Store user data first
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.rider));
          
          // Then store token if it exists
          if (response.data.data.token) {
            await AsyncStorage.setItem('userToken', response.data.data.token);
            console.log('Successfully stored token and user data');
          } else {
            console.warn('No token received in login response');
          }
        } catch (storageError) {
          console.warn('AsyncStorage error (non-critical):', storageError);
          // Don't throw or propagate the error
        }
      }
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data || { success: false, error: 'Login failed' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get<AuthResponse>('/auth/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to get user data' };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      throw { success: false, error: 'Logout failed' };
    }
  },

  // Test authenticated request
  testAuth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/auth/test');
      return response.data.success;
    } catch (error: any) {
      console.error('Auth test error:', error.response?.data || error);
      return false;
    }
  },
};

export default api;
