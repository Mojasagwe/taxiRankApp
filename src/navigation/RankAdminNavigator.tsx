import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import ManageRankScreen from '../screens/admin/ManageRankScreen';

export type RankAdminStackParamList = {
  ManageRank: { rankId: number; rankName: string };
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
    </Stack.Navigator>
  );
};

export default RankAdminNavigator;
