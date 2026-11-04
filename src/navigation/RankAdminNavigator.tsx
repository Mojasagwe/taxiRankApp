import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import ManageRankScreen from '../screens/admin/ManageRankScreen';
import RouteEditorScreen from '../screens/admin/RouteEditorScreen';
import { TaxiTerminal } from '../types/admin';

export type RankAdminStackParamList = {
  ManageRank: { rankId: number; rankName: string };
  /** No terminal: add a new route */
  RouteEditor: { rankId: number; terminal?: TaxiTerminal };
};

const Stack = createNativeStackNavigator<RankAdminStackParamList>();

/** A rank account manages exactly one rank, so its home is that rank */
const RankAdminNavigator: React.FC = () => {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ManageRank"
        component={ManageRankScreen}
        initialParams={{ rankId: user!.rank!.id, rankName: user!.rank!.name }}
      />
      <Stack.Screen name="RouteEditor" component={RouteEditorScreen} />
    </Stack.Navigator>
  );
};

export default RankAdminNavigator;
