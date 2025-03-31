import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import admin screens
import HomeScreen from '../screens/HomeScreen';
import AdminPendingRequestsScreen from '../screens/admin/AdminPendingRequestsScreen';
import AdminRequestDetailsScreen from '../screens/admin/AdminRequestDetailsScreen';
// TODO: Add other admin screens when implemented
// import ManageRankScreen from '../screens/admin/ManageRankScreen';
// import UpdateRankDetailsScreen from '../screens/admin/UpdateRankDetailsScreen';

export type AdminStackParamList = {
  Home: undefined;
  AdminPendingRequests: undefined;
  AdminRequestDetails: { requestId: string };
  ManageRank: { rankId: string };
  UpdateRankDetails: { rankId: string };
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AdminPendingRequests" component={AdminPendingRequestsScreen} />
      <Stack.Screen name="AdminRequestDetails" component={AdminRequestDetailsScreen} />
      {/* Add other admin screens here when implemented */}
      {/*
      <Stack.Screen name="ManageRank" component={ManageRankScreen} />
      <Stack.Screen name="UpdateRankDetails" component={UpdateRankDetailsScreen} />
      */}
    </Stack.Navigator>
  );
};

export default AdminNavigator; 