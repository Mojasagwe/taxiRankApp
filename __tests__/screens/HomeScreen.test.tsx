import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../../src/screens/HomeScreen';
import { useAuth } from '../../src/context/AuthContext';

// Mock the useAuth hook
jest.mock('../../src/context/AuthContext', () => {
  const originalModule = jest.requireActual('../../src/context/AuthContext');
  
  return {
    ...originalModule,
    useAuth: jest.fn()
  };
});

// Mock the navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

describe('HomeScreen', () => {
  const logoutMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders user welcome message', () => {
    // Mock regular user
    (useAuth as jest.Mock).mockReturnValue({
      user: { firstName: 'Test', role: 'USER' },
      logout: logoutMock,
      isAdmin: () => false,
      isSuperAdmin: () => false
    });
    
    const { getByText, queryByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    
    // Check that the welcome message includes the user's name
    expect(getByText('Welcome, Test')).toBeTruthy();
    
    // Check that it shows the commuter dashboard, not admin dashboard
    expect(getByText('Commuter Dashboard')).toBeTruthy();
    expect(queryByText('Admin Dashboard')).toBeNull();
    
    // Check that logout button is rendered
    expect(getByText('Logout')).toBeTruthy();
  });
  
  it('renders admin dashboard for admin users', () => {
    // Mock admin user
    (useAuth as jest.Mock).mockReturnValue({
      user: { 
        firstName: 'Admin', 
        role: 'ADMIN',
        managedRanks: ['rank1', 'rank2'] 
      },
      logout: logoutMock,
      isAdmin: () => true,
      isSuperAdmin: () => false
    });
    
    const { getByText, queryByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    
    // Check that the welcome message includes the admin's name
    expect(getByText('Welcome, Admin')).toBeTruthy();
    
    // Check that it shows the admin dashboard, not rider dashboard
    expect(getByText('Admin Dashboard')).toBeTruthy();
    expect(queryByText('Rider Dashboard')).toBeNull();
    
    // Check that admin-specific information is shown
    expect(getByText('Role: ADMIN')).toBeTruthy();
    expect(getByText('Managed Ranks: 2')).toBeTruthy();
    expect(getByText('View Pending Admin Requests')).toBeTruthy();
  });
  
  it('renders super admin dashboard for super admin users', () => {
    // Mock super admin user
    (useAuth as jest.Mock).mockReturnValue({
      user: { 
        firstName: 'SuperAdmin', 
        role: 'SUPER_ADMIN'
      },
      logout: logoutMock,
      isAdmin: () => false,
      isSuperAdmin: () => true
    });
    
    const { getByText, queryByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    
    // Check that the welcome message includes the super admin's name
    expect(getByText('Welcome, SuperAdmin')).toBeTruthy();
    
    // Check that it shows the super admin dashboard, not other dashboards
    expect(getByText('Super Admin Dashboard')).toBeTruthy();
    expect(queryByText('Admin Dashboard')).toBeNull();
    expect(queryByText('Commuter Dashboard')).toBeNull();
    
    // Check that super admin-specific information is shown
    expect(getByText('Role: SUPER_ADMIN')).toBeTruthy();
    expect(getByText('View Pending Admin Requests')).toBeTruthy();
  });
  
  it('calls logout when the logout button is pressed', () => {
    // Mock regular user
    (useAuth as jest.Mock).mockReturnValue({
      user: { firstName: 'Test', role: 'USER' },
      logout: logoutMock,
      isAdmin: () => false,
      isSuperAdmin: () => false
    });
    
    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    
    // Press the logout button
    fireEvent.press(getByText('Logout'));
    
    // Check that logout was called
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
}); 