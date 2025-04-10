import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import admin screens
import AdminDashboardScreen from '../screens/admin/dashboard/AdminDashboardScreen';
import AdminPendingRequestsScreen from '../screens/admin/AdminPendingRequestsScreen';
import AdminRequestDetailsScreen from '../screens/admin/AdminRequestDetailsScreen';
import AdminProfileScreen from '../screens/admin/profile/AdminProfileScreen';
import ManageRankScreen from '../screens/admin/ManageRankScreen';
// TODO: Add other admin screens when implemented
// import UpdateRankDetailsScreen from '../screens/admin/UpdateRankDetailsScreen';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminPendingRequests: undefined;
  AdminRequestDetails: { requestId: string };
  ManageRank: { rankId: number; rankName: string };
  UpdateRankDetails: { rankId: string };
  AdminProfile: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      initialRouteName="AdminDashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminPendingRequests" component={AdminPendingRequestsScreen} />
      <Stack.Screen name="AdminRequestDetails" component={AdminRequestDetailsScreen} />
      <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
      <Stack.Screen name="ManageRank" component={ManageRankScreen} />
      {/* Add other admin screens here when implemented */}
      {/*
      <Stack.Screen name="UpdateRankDetails" component={UpdateRankDetailsScreen} />
      */}
    </Stack.Navigator>
  );
};

export default AdminNavigator; 