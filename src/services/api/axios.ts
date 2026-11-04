import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  },
};

/** The backend's error message from a failed request, or a fallback */
export const apiError = (error: any, fallback = 'Something went wrong'): string =>
  error?.response?.data?.error || error?.response?.data?.message || (error?.response ? fallback : 'Cannot reach the Travy server');

export default api;
