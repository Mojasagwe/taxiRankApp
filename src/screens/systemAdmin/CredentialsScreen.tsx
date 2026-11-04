import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { Banner, Button, Screen } from '../../components/ui';
import { colors } from '../../theme';

/**
 * Shows a temporary password exactly once (approval, new user, reset).
 * The backend never returns it again, so leaving this screen loses it.
 */
const CredentialsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SystemAdminStackParamList>>();
  const { params } = useRoute<RouteProp<SystemAdminStackParamList, 'Credentials'>>();

  return (
    <Screen
      title={params.title}
      footer={<Button testID="credentials-done" title="Done" onPress={() => navigation.goBack()} />}
    >
      <Text style={styles.message}>{params.message}</Text>
      <View style={styles.box}>
        <Text style={styles.boxLabel}>LOGIN</Text>
        <View style={styles.pair}>
          <Text style={styles.key}>Username</Text>
          <Text selectable testID="credentials-login" style={styles.value}>{params.loginName}</Text>
        </View>
        <View style={styles.pair}>
          <Text style={styles.key}>Temporary password</Text>
          <Text selectable testID="credentials-password" style={styles.value}>{params.temporaryPassword}</Text>
        </View>
      </View>
      <Banner title="Shown once">
        Give it to them in person or by phone, never by SMS or email. They must set their own password at first login.
      </Banner>
    </Screen>
  );
};

const styles = StyleSheet.create({
  message: { fontSize: 15, lineHeight: 22, color: colors.textMuted },
  box: { backgroundColor: colors.ink, borderRadius: 18, padding: 20, gap: 16 },
  boxLabel: { fontSize: 12, fontWeight: '700', color: colors.gold, letterSpacing: 1 },
  pair: { gap: 4 },
  key: { fontSize: 13, color: '#c9c7c0' },
  value: { fontSize: 22, fontWeight: '700', color: '#f5f5f0', fontFamily: 'monospace', letterSpacing: 0.5 },
});

export default CredentialsScreen;
