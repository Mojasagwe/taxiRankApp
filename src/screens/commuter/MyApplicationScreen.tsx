import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { applicationService } from '../../services/api/applications';
import { apiError } from '../../services/api/axios';
import { Application } from '../../types/applications';
import { Banner, Button, Card, Chip, EmptyState, Loading, Screen, SectionLabel } from '../../components/ui';
import { STATUS_LABEL, STATUS_TONE, isOpen } from './applicationStatus';
import { colors } from '../../theme';

const date = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : '');

/** The applicant's latest application, the reviewer's note, and what happens next */
const MyApplicationScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    applicationService.mine().then(setApplications).catch(() => setApplications([]));
  }, []);
  useFocusEffect(load);

  const withdraw = (app: Application) =>
    Alert.alert('Withdraw application?', 'You can apply again later.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await applicationService.withdraw(app.id);
            load();
          } catch (e) {
            Alert.alert('Could not withdraw', apiError(e));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  if (!applications) {
    return <Loading />;
  }

  const [latest, ...earlier] = applications;
  const target = (app: Application) => app.rank?.name ?? app.proposedRank?.name ?? 'Rank';

  return (
    <Screen
      title="My application"
      onBack={() => navigation.goBack()}
      footer={
        latest && isOpen(latest.status) ? (
          <>
            <Button
              testID="resubmit-button"
              title={latest.status === 'INFO_REQUESTED' ? 'Update and resubmit' : 'Edit application'}
              onPress={() => navigation.navigate('Apply', { applicationId: latest.id })}
            />
            <Button title="Withdraw application" variant="danger" onPress={() => withdraw(latest)} loading={busy} />
          </>
        ) : (
          <Button title="Apply to manage a rank" onPress={() => navigation.navigate('Apply', {})} />
        )
      }
    >
      {!latest ? (
        <EmptyState>You haven't applied yet</EmptyState>
      ) : (
        <>
          <Card>
            <View style={styles.row}>
              <View style={styles.flex}>
                <SectionLabel>{latest.rank ? 'Existing rank' : 'New rank proposed'}</SectionLabel>
                <Text style={styles.name}>{target(latest)}</Text>
              </View>
              <Chip label={STATUS_LABEL[latest.status]} tone={STATUS_TONE[latest.status]} />
            </View>
            <Text style={styles.meta}>Submitted {date(latest.createdAt)} · Ref APP-{String(latest.id).padStart(4, '0')}</Text>
          </Card>

          {latest.reviewerNote && latest.status !== 'APPROVED' ? (
            <Banner tone={latest.status === 'REJECTED' ? 'danger' : 'info'} title="Note from the System Administrator">
              {latest.reviewerNote}
            </Banner>
          ) : null}

          {latest.status === 'APPROVED' ? (
            <Banner tone="success" title="Approved">
              {`Your rank's account ${latest.rankAccountLoginName ?? ''} was created. The System Administrator will give you its login in person or by phone.`}
            </Banner>
          ) : null}

          <Card>
            <Text style={styles.section}>What happens next</Text>
            <Text style={styles.step}>
              {latest.status === 'PENDING' && 'A System Administrator is reviewing your application.'}
              {latest.status === 'INFO_REQUESTED' && 'Update your application with the requested information and resubmit it.'}
              {latest.status === 'APPROVED' && 'Log in with the rank code and temporary password, then set the rank’s own password.'}
              {latest.status === 'REJECTED' && 'You can apply again with more detail.'}
              {latest.status === 'WITHDRAWN' && 'You withdrew this application. You can apply again any time.'}
            </Text>
          </Card>

          {earlier.length ? <SectionLabel>Earlier applications</SectionLabel> : null}
          {earlier.map(app => (
            <Card key={app.id} style={styles.row}>
              <Text style={styles.flex}>{target(app)}</Text>
              <Chip label={STATUS_LABEL[app.status]} tone={STATUS_TONE[app.status]} />
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1, gap: 4 },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  meta: { fontSize: 13, color: colors.textSubtle },
  section: { fontSize: 15, fontWeight: '700', color: colors.text },
  step: { fontSize: 14, lineHeight: 21, color: colors.textMuted },
});

export default MyApplicationScreen;
