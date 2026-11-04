import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiError } from '../../services/api/axios';
import { Banner, Button, Field, Screen } from '../../components/ui';
import { colors } from '../../theme';

/**
 * Shown on its own after an admin-issued temporary password (new rank account
 * or reset); the backend blocks everything else until the password changes.
 */
const ChangePasswordScreen: React.FC = () => {
  const { user, changePassword, logout } = useAuth();
  const isRankAccount = !!user?.rank;
  const minLength = isRankAccount ? 12 : 8;
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const rules = [
    { ok: next.length >= minLength, text: `At least ${minLength} characters` },
    { ok: next.length > 0 && next !== current, text: 'Not the temporary password' },
    { ok: next.length > 0 && next === confirm, text: 'Passwords match' },
  ];

  const handleSave = async () => {
    if (!current || rules.some(r => !r.ok)) {
      setError('Check the requirements below');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await changePassword(current, next);
      // mustChangePassword is now false, so AppNavigator shows the normal screens
    } catch (e) {
      setError(apiError(e, 'Could not change the password'));
      setSaving(false);
    }
  };

  return (
    <Screen
      subtitle={isRankAccount ? `${user?.rank?.code} · ${user?.rank?.name}` : user?.displayName}
      title={isRankAccount ? "Set your rank's password" : 'Set a new password'}
      footer={
        <>
          <Button testID="save-password-button" title="Save and continue" onPress={handleSave} loading={saving} />
          <Button title="Log out" variant="link" onPress={logout} />
        </>
      }
    >
      <Text>
        {isRankAccount
          ? 'This login belongs to the rank and is shared by your team. Keep it somewhere safe that your team can reach.'
          : 'Your password was reset by a System Administrator. Choose your own to continue.'}
      </Text>
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <Field testID="current-password-input" label="Temporary password" value={current} onChangeText={setCurrent} secureTextEntry autoCapitalize="none" />
      <Field testID="new-password-input" label="New password" value={next} onChangeText={setNext} secureTextEntry autoCapitalize="none" />
      <Field testID="confirm-password-input" label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" />
      {rules.map(rule => (
        <Text key={rule.text} style={rule.ok ? styles.ruleOk : styles.muted}>
          {rule.ok ? '✓' : '•'} {rule.text}
        </Text>
      ))}
      <Text style={styles.muted}>Lost it later? Contact the Travy System Administrator to reset it.</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  ruleOk: { color: colors.success },
  muted: { color: colors.textSubtle },
});

export default ChangePasswordScreen;
