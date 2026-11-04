import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/ui';

import AuthNavigator from './AuthNavigator';
import CommuterNavigator from './CommuterNavigator';
import RankAdminNavigator from './RankAdminNavigator';
import SystemAdminNavigator from './SystemAdminNavigator';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';

export type RootStackParamList = {
  Auth: undefined;
  ChangePassword: undefined;
  SystemAdmin: undefined;
  RankAdmin: undefined;
  Commuter: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Picks the screens from the account's permissions, never its profile name, so a
 * new profile only needs the right permissions on the backend.
 */
const AppNavigator: React.FC = () => {
  const { user, loading, can } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.mustChangePassword ? (
          // The backend blocks everything else until a temporary password is replaced
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        ) : can('APPLICATIONS_REVIEW') || can('USERS_VIEW') ? (
          <Stack.Screen name="SystemAdmin" component={SystemAdminNavigator} />
        ) : can('RANK_MANAGE_OWN') ? (
          <Stack.Screen name="RankAdmin" component={RankAdminNavigator} />
        ) : (
          <Stack.Screen name="Commuter" component={CommuterNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
