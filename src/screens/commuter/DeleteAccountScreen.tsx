import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { myAccountService } from '../../services/api/account';
import { applicationService } from '../../services/api/applications';
import { apiError } from '../../services/api/axios';
import { Application } from '../../types/applications';
import { Banner, Button, Card, Field, Screen } from '../../components/ui';
import { isOpen } from './applicationStatus';
import { colors } from '../../theme';

const CONFIRM_WORD = 'DELETE';

/** R6: permanent deletion (POPIA). Needs the password and the word DELETE. */
const DeleteAccountScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout, can } = useAuth();
  const [openApplication, setOpenApplication] = useState<Application | null>(null);
  const [password, setPassword] = useState('');
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const ready = typed.trim().toUpperCase() === CONFIRM_WORD && password.length > 0;

  useEffect(() => {
    if (can('APPLICATIONS_SUBMIT')) {
      applicationService
        .mine()
        .then(apps => setOpenApplication(apps.find(a => isOpen(a.status)) ?? null))
        .catch(() => setOpenApplication(null));
    }
  }, [can]);

  const remove = async () => {
    setError(null);
    setDeleting(true);
    try {
      await myAccountService.deleteAccount(password, typed.trim());
      Alert.alert('Account deleted', 'Your Travy account and personal details have been deleted.');
      await logout();
    } catch (e) {
      setError(apiError(e, 'Could not delete your account'));
      setDeleting(false);
    }
  };

  return (
    <Screen
      title="Delete account"
      onBack={navigation.goBack}
      footer={
        <>
          <Button testID="confirm-delete" title="Delete my account" variant="destructive" onPress={remove} disabled={!ready} loading={deleting} />
          <Button title="Keep my account" variant="link" onPress={navigation.goBack} />
        </>
      }
    >
      <Card>
        <Text style={styles.heading}>What gets deleted</Text>
        <Text style={styles.body}>• Your name, email, mobile number and photo{'\n'}• Your trip history{'\n'}• Your notification settings</Text>
        <Text style={[styles.heading, styles.spaced]}>What stays</Text>
        <Text style={styles.body}>
          • Anonymous counts (e.g. how many trips a rank serves), with nothing that identifies you{'\n'}• Rank accounts belong to the
          rank, not you. If you're a rank's responsible person, a System Administrator assigns someone new.
        </Text>
      </Card>
      {openApplication ? (
        <Banner>{`Your open rank application (${openApplication.rank?.name ?? openApplication.proposedRank?.name}) will be withdrawn.`}</Banner>
      ) : null}
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <Field testID="delete-password" label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
      <Field
        testID="delete-confirm"
        label={`Type ${CONFIRM_WORD} to confirm`}
        value={typed}
        onChangeText={setTyped}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <Text style={styles.muted}>This can't be undone. You can sign up again later with the same email.</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  heading: { fontSize: 15, fontWeight: '700', color: colors.text },
  spaced: { marginTop: 6 },
  body: { fontSize: 14, lineHeight: 21, color: '#3f3f3f' },
  muted: { fontSize: 13, color: colors.textSubtle },
});

export default DeleteAccountScreen;
