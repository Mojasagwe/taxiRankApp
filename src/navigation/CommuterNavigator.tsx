import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { RiderTabBar } from '../components/rider';

import HomeScreen from '../screens/HomeScreen';
import ApplyScreen from '../screens/commuter/ApplyScreen';
import MyApplicationScreen from '../screens/commuter/MyApplicationScreen';
import ProfileScreen from '../screens/commuter/ProfileScreen';
import EditDetailsScreen from '../screens/commuter/EditDetailsScreen';
import MyPasswordScreen from '../screens/commuter/MyPasswordScreen';
import TripsScreen from '../screens/commuter/TripsScreen';
import LogTripScreen from '../screens/commuter/LogTripScreen';
import SettingsScreen from '../screens/commuter/SettingsScreen';
import DeleteAccountScreen from '../screens/commuter/DeleteAccountScreen';
import DestinationSearchScreen from '../screens/commuter/DestinationSearchScreen';
import JourneyResultsScreen from '../screens/commuter/JourneyResultsScreen';
import RouteDetailScreen from '../screens/commuter/RouteDetailScreen';
import ConnectingRouteScreen from '../screens/commuter/ConnectingRouteScreen';
import ActiveTripScreen from '../screens/commuter/ActiveTripScreen';
import TripQuestionsScreen from '../screens/commuter/TripQuestionsScreen';
import { ConnectingOption, DirectOption, Place } from '../types/journeys';
import { Trip } from '../types/trips';

export type RiderTabParamList = {
  Home: undefined;
  Trips: undefined;
  Profile: undefined;
};

export type CommuterStackParamList = {
  Tabs: NavigatorScreenParams<RiderTabParamList> | undefined;
  /** applicationId: edit and resubmit that application */
  Apply: { applicationId?: number } | undefined;
  MyApplication: undefined;
  EditDetails: undefined;
  MyPassword: undefined;
  LogTrip: undefined;
  Settings: undefined;
  DeleteAccount: undefined;
  DestinationSearch: { radiusKm: number };
  JourneyResults: { place: Place; radiusKm: number };
  RouteDetail: { option: DirectOption; place: Place };
  ConnectingRoute: { option: ConnectingOption; place: Place };
  ActiveTrip: undefined;
  TripQuestions: { trip: Trip };
};

const Stack = createNativeStackNavigator<CommuterStackParamList>();
const Tab = createBottomTabNavigator<RiderTabParamList>();

const RiderTabs: React.FC = () => (
  <Tab.Navigator tabBar={props => <RiderTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
    <Tab.Screen name="Trips" component={TripsScreen} options={{ title: 'Trips' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

const CommuterNavigator: React.FC = () => {
  const { signUpIntent } = useAuth();
  return (
    <Stack.Navigator
      // People who signed up as "Rank admin" go straight to step 2, the application
      initialRouteName={signUpIntent === 'RANK_ADMIN' ? 'Apply' : 'Tabs'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Tabs" component={RiderTabs} />
      <Stack.Screen name="Apply" component={ApplyScreen} />
      <Stack.Screen name="MyApplication" component={MyApplicationScreen} />
      <Stack.Screen name="EditDetails" component={EditDetailsScreen} />
      <Stack.Screen name="MyPassword" component={MyPasswordScreen} />
      <Stack.Screen name="LogTrip" component={LogTripScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="DestinationSearch" component={DestinationSearchScreen} />
      <Stack.Screen name="JourneyResults" component={JourneyResultsScreen} />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
      <Stack.Screen name="ConnectingRoute" component={ConnectingRouteScreen} />
      <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} />
      <Stack.Screen name="TripQuestions" component={TripQuestionsScreen} />
    </Stack.Navigator>
  );
};

export default CommuterNavigator;
