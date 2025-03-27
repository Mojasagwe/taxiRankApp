import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api/axios';
import { AuthContextType, User, AuthResponse, RegisterRequest } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored user data on app start
    checkUser();
  }, []);

  const checkUser = async (): Promise<void> => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('userToken');
      console.log('Stored token:', token ? 'Present' : 'Missing');
      console.log('Stored user data:', userData ? 'Present' : 'Missing');
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        return false;
      }
      
      const isAuthenticated = await authService.testAuth();
      console.log('Auth test result:', isAuthenticated);
      return isAuthenticated;
    } catch (error) {
      console.error('Auth test error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      if (response.success && response.data?.rider) {
        const riderData = response.data.rider;
        setUser(riderData);
        await AsyncStorage.setItem('userData', JSON.stringify(riderData));
        if (response.data && response.data.token) {
          await AsyncStorage.setItem('userToken', response.data.token);
        }
      }
      return response;
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      setError(null);
      const response = await authService.register(userData);
      console.log('Registration response in context:', response); // Debug log
      
      if (response.success && response.data?.rider) {
        const riderData = response.data.rider;
        setUser(riderData);
        return response;
      }
      
      // If we get here, something went wrong
      const errorMessage = response.error || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } catch (error: any) {
      console.error('Registration error in context:', error);
      // Only set error if it's not an AsyncStorage error and not a warning
      if (!error.message?.includes('AsyncStorage') && !error.message?.includes('non-critical')) {
        const errorMessage = error.message || 'Registration failed';
        setError(errorMessage);
      }
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
      // Clear stored data
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userToken');
    } catch (error: any) {
      setError(error.message || 'Logout failed');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    testAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 