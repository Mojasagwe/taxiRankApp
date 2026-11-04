import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ApplicationsScreen from '../screens/systemAdmin/ApplicationsScreen';
import ApplicationReviewScreen from '../screens/systemAdmin/ApplicationReviewScreen';
import CredentialsScreen from '../screens/systemAdmin/CredentialsScreen';
import UsersScreen from '../screens/systemAdmin/UsersScreen';
import UserDetailScreen from '../screens/systemAdmin/UserDetailScreen';

export type SystemAdminStackParamList = {
  Applications: undefined;
  ApplicationReview: { id: number };
  /** One-time display of a temporary password */
  Credentials: { title: string; message: string; loginName: string; temporaryPassword: string };
  Users: undefined;
  UserDetail: { id: number };
};

const Stack = createNativeStackNavigator<SystemAdminStackParamList>();

const SystemAdminNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="Applications" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Applications" component={ApplicationsScreen} options={{ animation: 'none' }} />
    <Stack.Screen name="Users" component={UsersScreen} options={{ animation: 'none' }} />
    <Stack.Screen name="ApplicationReview" component={ApplicationReviewScreen} />
    <Stack.Screen name="UserDetail" component={UserDetailScreen} />
    <Stack.Screen name="Credentials" component={CredentialsScreen} options={{ gestureEnabled: false }} />
  </Stack.Navigator>
);

export default SystemAdminNavigator;
