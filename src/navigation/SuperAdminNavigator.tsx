import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import super admin screens
import HomeScreen from '../screens/HomeScreen';
import AdminPendingRequestsScreen from '../screens/admin/AdminPendingRequestsScreen';
import AdminRequestDetailsScreen from '../screens/admin/AdminRequestDetailsScreen';
// TODO: Add other super admin screens when implemented
// import AllRanksScreen from '../screens/superadmin/AllRanksScreen';
// import AllAdminsScreen from '../screens/superadmin/AllAdminsScreen';
// import SystemSettingsScreen from '../screens/superadmin/SystemSettingsScreen';

export type SuperAdminStackParamList = {
  Home: undefined;
  AdminPendingRequests: undefined;
  AdminRequestDetails: { requestId: string };
  AllRanks: undefined;
  AllAdmins: undefined;
  SystemSettings: undefined;
};

const Stack = createNativeStackNavigator<SuperAdminStackParamList>();

const SuperAdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AdminPendingRequests" component={AdminPendingRequestsScreen} />
      <Stack.Screen name="AdminRequestDetails" component={AdminRequestDetailsScreen} />
      {/* Add other super admin screens here when implemented */}
      {/*
      <Stack.Screen name="AllRanks" component={AllRanksScreen} />
      <Stack.Screen name="AllAdmins" component={AllAdminsScreen} />
      <Stack.Screen name="SystemSettings" component={SystemSettingsScreen} />
      */}
    </Stack.Navigator>
  );
};

export default SuperAdminNavigator; 