import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../types/auth';
import { Platform } from 'react-native';

// Available API environments
const API_ENVIRONMENTS = {
  LOCAL: {
    ios: 'http://localhost:8080/api',
    android: 'http://10.0.2.2:8080/api',
    default: 'http://localhost:8080/api',
  },
  TEST: 'https://taxi-rank-backend-30afe3719f7a.herokuapp.com/api',
};

// Check if we should use the test environment
const getApiUrl = async () => {
  try {
    const useTestEnv = await AsyncStorage.getItem('useTestEnvironment');
    if (useTestEnv === 'true') {
      return API_ENVIRONMENTS.TEST;
    }
  } catch (error) {
    console.log('Error checking environment setting:', error);
  }
  
  // Default to local environment if test environment is not explicitly set
  return Platform.select(API_ENVIRONMENTS.LOCAL);
};

// Create a default instance first, we'll update the baseURL after initialization
const api: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize the API with the correct base URL
(async () => {
  const baseURL = await getApiUrl();
  api.defaults.baseURL = baseURL;
  console.log('API initialized with baseURL:', baseURL);
})();

// Add token to requests if it exists
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

// Helper functions to switch environments
export const apiEnvironment = {
  useTestEnvironment: async () => {
    await AsyncStorage.setItem('useTestEnvironment', 'true');
    api.defaults.baseURL = API_ENVIRONMENTS.TEST;
    console.log('Switched to TEST environment:', API_ENVIRONMENTS.TEST);
  },
  useLocalEnvironment: async () => {
    await AsyncStorage.setItem('useTestEnvironment', 'false');
    const localUrl = Platform.select(API_ENVIRONMENTS.LOCAL);
    api.defaults.baseURL = localUrl;
    console.log('Switched to LOCAL environment:', localUrl);
  },
  getCurrentEnvironment: async () => {
    const useTestEnv = await AsyncStorage.getItem('useTestEnvironment');
    return useTestEnv === 'true' ? 'TEST' : 'LOCAL';
  }
};

// Auth service
export const authService = {
  // Register new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      console.log('Registration response:', response.data); // Debug log
      
      // Store token after successful registration
      if (response.data.success) {
        try {
          // Get the user data from either rider or user field
          const userData = response.data.data?.user || response.data.data?.rider;
          
          if (userData) {
            // Store user data first
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            
            // Then store token if it exists
            if (response.data.data?.token) {
              await AsyncStorage.setItem('userToken', response.data.data.token);
            } else {
              console.warn('No token received in registration response');
            }
          }
        } catch (storageError) {
          // Silently handle AsyncStorage errors
          console.warn('AsyncStorage error (non-critical):', storageError);
          // Don't throw or propagate the error
        }
      }
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error);
      throw error.response?.data || { success: false, error: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.success && (response.data.data?.rider || response.data.data?.user)) {
        try {
          // Get the user data from either rider or user field
          const userData = response.data.data?.user || response.data.data?.rider;
          
          // Store user data first
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          
          // Then store token if it exists
          if (response.data.data?.token) {
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
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get<AuthResponse>('/auth/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to get user data' };
    }
  },

  // Logout user
  logout: async (): Promise<AuthResponse> => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return { success: true, message: 'Logged out successfully' };
    } catch (error: any) {
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
