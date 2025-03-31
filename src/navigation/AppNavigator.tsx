import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Import navigators
import AuthNavigator from './AuthNavigator';
import CommuterNavigator from './CommuterNavigator';
import AdminNavigator from './AdminNavigator';
import SuperAdminNavigator from './SuperAdminNavigator';

// Create a new RootStackParamList for the main navigator
export type RootStackParamList = {
  Auth: undefined;
  Commuter: undefined;
  Admin: undefined;
  SuperAdmin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();

  if (loading) {
    // You might want to show a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Navigator - screens for authentication flow
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : isSuperAdmin() ? (
          // Super Admin Navigator - screens for super admin users
          <Stack.Screen name="SuperAdmin" component={SuperAdminNavigator} />
        ) : isAdmin() ? (
          // Admin Navigator - screens for rank admin users
          <Stack.Screen name="Admin" component={AdminNavigator} />
        ) : (
          // Commuter Navigator - screens for regular commuter users
          <Stack.Screen name="Commuter" component={CommuterNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 