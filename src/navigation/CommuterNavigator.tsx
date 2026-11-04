import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import ApplyScreen from '../screens/commuter/ApplyScreen';
import MyApplicationScreen from '../screens/commuter/MyApplicationScreen';

export type CommuterStackParamList = {
  Home: undefined;
  /** applicationId: edit and resubmit that application */
  Apply: { applicationId?: number } | undefined;
  MyApplication: undefined;
};

const Stack = createNativeStackNavigator<CommuterStackParamList>();

const CommuterNavigator: React.FC = () => {
  const { signUpIntent } = useAuth();
  return (
    <Stack.Navigator
      // People who signed up as "Rank admin" go straight to step 2, the application
      initialRouteName={signUpIntent === 'RANK_ADMIN' ? 'Apply' : 'Home'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Apply" component={ApplyScreen} />
      <Stack.Screen name="MyApplication" component={MyApplicationScreen} />
    </Stack.Navigator>
  );
};

export default CommuterNavigator;
