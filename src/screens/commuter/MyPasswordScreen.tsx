import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { apiError } from '../../services/api/axios';
import { Banner, Button, Field, Screen } from '../../components/ui';
import { PasswordRules, passwordRules } from '../../components/forms';
import { colors } from '../../theme';

/** R3: change your own password; every other phone signed in to the account is logged out */
const MyPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { rules, valid } = passwordRules(current, next, confirm);

  const save = async () => {
    if (!valid) {
      setError(current ? 'Check the requirements below' : 'Enter your current password');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await changePassword(current, next);
      Alert.alert('Password changed', 'Other phones using your account have been logged out.');
      navigation.goBack();
    } catch (e) {
      setError(apiError(e, 'Could not change your password'));
      setSaving(false);
    }
  };

  return (
    <Screen
      title="Change password"
      onBack={navigation.goBack}
      footer={<Button testID="change-password" title="Change password" onPress={save} loading={saving} />}
    >
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <Field testID="current-password" label="Current password" value={current} onChangeText={setCurrent} secureTextEntry autoCapitalize="none" />
      <Field testID="new-password" label="New password" value={next} onChangeText={setNext} secureTextEntry autoCapitalize="none" />
      <Field testID="confirm-password" label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" />
      <PasswordRules rules={rules} />
      <Banner tone="info">You'll stay logged in on this phone. Any other phone using your account will be logged out.</Banner>
      <Text style={styles.muted}>
        Forgot your current password? Log out and ask the Travy System Administrator to reset it. Reset by email is coming.
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  muted: { fontSize: 14, lineHeight: 20, color: colors.textSubtle },
});

export default MyPasswordScreen;
