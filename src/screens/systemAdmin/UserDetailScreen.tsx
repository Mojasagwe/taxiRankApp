import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { useAuth } from '../../context/AuthContext';
import { userAdminService } from '../../services/api/users';
import { apiError } from '../../services/api/axios';
import { UserDetail } from '../../types/applications';
import { AccountStatus } from '../../types/auth';
import { Banner, Button, Card, Chip, Field, Loading, Screen, SectionLabel, Segmented } from '../../components/ui';
import { EVENT_LABEL, STATUS_HELP, STATUS_LABEL, STATUS_TONE } from './accountStatus';
import { colors } from '../../theme';

/** Profile, status, password reset and history for one account */
const UserDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SystemAdminStackParamList>>();
  const { params } = useRoute<RouteProp<SystemAdminStackParamList, 'UserDetail'>>();
  const { user: me, can } = useAuth();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [status, setStatus] = useState<AccountStatus>('ACTIVE');
  const [reason, setReason] = useState('');
  const [person, setPerson] = useState({ name: '', phone: '' });
  const [editingPerson, setEditingPerson] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const loaded = await userAdminService.get(params.id);
      setDetail(loaded);
      setStatus(loaded.user.accountStatus);
      setReason(loaded.user.statusReason ?? '');
      setPerson({ name: loaded.user.responsiblePersonName ?? '', phone: loaded.user.responsiblePersonPhone ?? '' });
    } catch (e) {
      setError(apiError(e, 'Could not load this user'));
    }
  }, [params.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  if (!detail) {
    return error ? (
      <Screen title="User" onBack={() => navigation.goBack()}>
        <Banner tone="danger">{error}</Banner>
      </Screen>
    ) : (
      <Loading />
    );
  }

  const { user, history } = detail;
  const isSelf = user.id === me?.id;
  const statusChanged = status !== user.accountStatus || (status !== 'ACTIVE' && reason.trim() !== (user.statusReason ?? ''));

  const saveStatus = () => {
    if (status !== 'ACTIVE' && !reason.trim()) {
      setError('A reason is required to flag, suspend or block an account');
      return;
    }
    return run(async () => {
      await userAdminService.setStatus(user.id, status, status === 'ACTIVE' ? undefined : reason.trim());
      await load();
    });
  };

  const resetPassword = () =>
    Alert.alert('Reset password?', `${user.loginName}'s current password stops working immediately.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () =>
          run(async () => {
            const issued = await userAdminService.resetPassword(user.id);
            navigation.navigate('Credentials', {
              title: 'Password reset',
              message: `${user.displayName} must set a new password at their next login.`,
              loginName: issued.loginName,
              temporaryPassword: issued.temporaryPassword,
            });
          }),
      },
    ]);

  const savePerson = () =>
    run(async () => {
      await userAdminService.setResponsiblePerson(user.id, person.name.trim(), person.phone.trim());
      setEditingPerson(false);
      await load();
    });

  return (
    <Screen title={user.rank ? 'Rank account' : 'User'} onBack={() => navigation.goBack()}>
      {error ? <Banner tone="danger">{error}</Banner> : null}

      <Card>
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.meta}>
          {user.rank ? `Username ${user.loginName}` : user.loginName}
          {user.lastLogin ? ` · last login ${new Date(user.lastLogin).toLocaleDateString()}` : ' · never logged in'}
        </Text>
        <View style={styles.row}>
          <Chip label={user.profileName} />
          <Chip label={STATUS_LABEL[user.accountStatus]} tone={STATUS_TONE[user.accountStatus]} />
          {user.mustChangePassword ? <Chip label="Temporary password" tone="warn" /> : null}
        </View>
      </Card>

      {user.rank ? (
        <Card>
          <SectionLabel>Manages</SectionLabel>
          <Text style={styles.value}>{user.rank.code} · {user.rank.name}</Text>
          <SectionLabel>Responsible person</SectionLabel>
          {editingPerson ? (
            <>
              <Field label="Name" value={person.name} onChangeText={v => setPerson(p => ({ ...p, name: v }))} />
              <Field label="Phone" value={person.phone} onChangeText={v => setPerson(p => ({ ...p, phone: v }))} keyboardType="phone-pad" />
              <Button title="Save responsible person" onPress={savePerson} loading={busy} />
              <Button title="Cancel" variant="link" onPress={() => setEditingPerson(false)} />
            </>
          ) : (
            <View style={styles.row}>
              <Text style={[styles.value, styles.flex]}>{user.responsiblePersonName} · {user.responsiblePersonPhone}</Text>
              {can('USERS_MANAGE') ? <Button title="Hand over" variant="secondary" onPress={() => setEditingPerson(true)} /> : null}
            </View>
          )}
        </Card>
      ) : (
        <Card>
          <SectionLabel>Contact</SectionLabel>
          <Text style={styles.value}>{[user.email, user.phoneNumber].filter(Boolean).join(' · ')}</Text>
        </Card>
      )}

      {can('USERS_SET_STATUS') && !isSelf ? (
        <Card>
          <Text style={styles.section}>Account status</Text>
          <Segmented<AccountStatus>
            value={status}
            onChange={setStatus}
            options={(['ACTIVE', 'FLAGGED', 'SUSPENDED', 'BLOCKED'] as AccountStatus[]).map(s => ({ value: s, label: STATUS_LABEL[s] }))}
          />
          <Text style={styles.meta}>{STATUS_HELP[status]}</Text>
          {status !== 'ACTIVE' ? (
            <Field testID="status-reason" label="Reason (logged and shown to the account)" value={reason} onChangeText={setReason} multiline />
          ) : null}
          {statusChanged ? <Button testID="save-status" title="Save status" onPress={saveStatus} loading={busy} /> : null}
        </Card>
      ) : null}

      {can('USERS_RESET_PASSWORD') && !isSelf ? (
        <Card>
          <Text style={styles.section}>Password</Text>
          <Text style={styles.meta}>
            {user.rank ? "Use when the rank's staff change or the password is lost." : 'Use when they lose access.'} The old password stops working immediately.
          </Text>
          <Button testID="reset-password" title="Reset password" variant="secondary" onPress={resetPassword} loading={busy} />
        </Card>
      ) : null}

      <Card>
        <Text style={styles.section}>History</Text>
        {history.length === 0 ? <Text style={styles.meta}>Nothing yet</Text> : null}
        {history.map((event, i) => (
          <View key={i} style={styles.event}>
            <Text style={styles.eventText}>
              {EVENT_LABEL[event.action] ?? event.action}
              {event.details ? ` — ${event.details}` : ''}
              {` · ${event.actorName}`}
            </Text>
            <Text style={styles.meta}>{new Date(event.createdAt).toLocaleDateString()}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  flex: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  meta: { fontSize: 13, color: colors.textSubtle, lineHeight: 19 },
  value: { fontSize: 15, fontWeight: '600', color: colors.text },
  section: { fontSize: 15, fontWeight: '700', color: colors.text },
  event: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  eventText: { flex: 1, fontSize: 13, color: colors.text },
});

export default UserDetailScreen;
