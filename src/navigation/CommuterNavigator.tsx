import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import commuter screens
import HomeScreen from '../screens/HomeScreen';
// TODO: Add other commuter screens when implemented
// import SearchRanksScreen from '../screens/commuter/SearchRanksScreen';
// import PlanTripScreen from '../screens/commuter/PlanTripScreen';
// import TripDetailsScreen from '../screens/commuter/TripDetailsScreen';
// import ProfileScreen from '../screens/commuter/ProfileScreen';

export type CommuterStackParamList = {
  Home: undefined;
  SearchRanks: undefined;
  PlanTrip: undefined;
  TripDetails: { tripId: string };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<CommuterStackParamList>();

const CommuterNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* Add other commuter screens here when implemented */}
      {/* 
      <Stack.Screen name="SearchRanks" component={SearchRanksScreen} />
      <Stack.Screen name="PlanTrip" component={PlanTripScreen} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      */}
    </Stack.Navigator>
  );
};

export default CommuterNavigator; 