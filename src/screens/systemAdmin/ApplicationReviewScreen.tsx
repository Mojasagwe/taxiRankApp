import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { applicationService } from '../../services/api/applications';
import { apiError } from '../../services/api/axios';
import { Application } from '../../types/applications';
import { Banner, Button, Card, Chip, Field, Loading, Screen, SectionLabel } from '../../components/ui';
import { STATUS_LABEL, STATUS_TONE, isOpen } from '../commuter/applicationStatus';
import { colors } from '../../theme';

type Action = 'request-info' | 'reject' | null;

/**
 * Review one application. For new-rank proposals the reviewer can correct the
 * details and set the rank code before approving, or link to a nearby rank.
 */
const ApplicationReviewScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SystemAdminStackParamList>>();
  const { params } = useRoute<RouteProp<SystemAdminStackParamList, 'ApplicationReview'>>();
  const [app, setApp] = useState<Application | null>(null);
  const [rank, setRank] = useState({ name: '', address: '', city: '', province: '' });
  const [code, setCode] = useState('');
  const [action, setAction] = useState<Action>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const loaded = await applicationService.get(params.id);
      setApp(loaded);
      const p = loaded.proposedRank;
      if (p) {
        setRank({ name: p.name, address: p.address, city: p.city, province: p.province });
      }
    } catch (e) {
      setError(apiError(e, 'Could not load the application'));
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

  const approve = () =>
    run(async () => {
      const proposal = app!.proposedRank;
      const overrides = app!.rank
        ? undefined
        : {
            code: code.trim() ? code.trim().toUpperCase() : undefined,
            rank: { ...proposal!, ...rank },
          };
      const result = await applicationService.approve(app!.id, overrides);
      navigation.replace('Credentials', {
        title: `${result.application.rank?.name ?? rank.name} is live`,
        message: `Rank ${result.loginName} has its rank admin account. ${app!.applicant.name} is recorded as the responsible person.`,
        loginName: result.loginName,
        temporaryPassword: result.temporaryPassword,
      });
    });

  const sendNote = () => {
    if (!note.trim()) {
      setError(action === 'reject' ? 'Give a reason for rejecting' : 'Write a message to the applicant');
      return;
    }
    return run(async () => {
      const updated = action === 'reject'
        ? await applicationService.reject(app!.id, note.trim())
        : await applicationService.requestInfo(app!.id, note.trim());
      setApp(updated);
      setAction(null);
      setNote('');
    });
  };

  const link = (rankId: number, rankName: string) =>
    Alert.alert('Link to existing rank?', `Approve against ${rankName} instead of creating a new rank.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Link', onPress: () => run(async () => setApp(await applicationService.linkToRank(app!.id, rankId))) },
    ]);

  if (!app) {
    return error ? (
      <Screen title="Review" onBack={() => navigation.goBack()}>
        <Banner tone="danger">{error}</Banner>
      </Screen>
    ) : (
      <Loading />
    );
  }

  const open = isOpen(app.status);

  return (
    <Screen
      title={`Review APP-${String(app.id).padStart(4, '0')}`}
      subtitle={app.rank ? 'Existing rank' : 'New rank'}
      onBack={() => navigation.goBack()}
      footer={
        open ? (
          <>
            <Button testID="approve-button" title={app.rank ? 'Approve · create rank account' : 'Approve · add rank & create rank account'} onPress={approve} loading={busy} />
            <View style={styles.row}>
              <Button title="Request info" variant="info" style={styles.flex} onPress={() => setAction('request-info')} />
              <Button testID="reject-button" title="Reject" variant="danger" style={styles.flex} onPress={() => setAction('reject')} />
            </View>
          </>
        ) : undefined
      }
    >
      {error ? <Banner tone="danger">{error}</Banner> : null}
      {!open ? (
        <View style={styles.row}>
          <Text style={styles.flex}>This application is closed.</Text>
          <Chip label={STATUS_LABEL[app.status]} tone={STATUS_TONE[app.status]} />
        </View>
      ) : null}

      <Card>
        <SectionLabel>Applicant (responsible person)</SectionLabel>
        <Text style={styles.name}>{app.applicant.name}</Text>
        <Text style={styles.meta}>{[app.designation, app.applicant.email, app.applicant.phoneNumber].filter(Boolean).join(' · ')}</Text>
        {app.motivation ? <Text style={styles.quote}>“{app.motivation}”</Text> : null}
      </Card>

      {app.reviewerNote ? <Banner tone="info" title="Last note to the applicant">{app.reviewerNote}</Banner> : null}

      {app.nearbyRanks && app.nearbyRanks.length > 0 && !app.rank ? (
        <Banner tone="alert" title="Possible duplicate">
          {app.nearbyRanks.map(near => (
            <View key={near.id} style={styles.row}>
              <Text style={styles.flex}>
                {near.name} · {near.code} · {near.distanceMeters} m away{near.hasAccount ? ' · has a rank admin' : ''}
              </Text>
              {open && !near.hasAccount ? <Button title="Link instead" variant="secondary" onPress={() => link(near.id, near.name)} /> : null}
            </View>
          ))}
        </Banner>
      ) : null}

      {app.rank ? (
        <Card>
          <SectionLabel>Rank</SectionLabel>
          <Text style={styles.name}>{app.rank.name}</Text>
          <Text style={styles.meta}>{app.rank.code}{app.rank.city ? ` · ${app.rank.city}` : ''}</Text>
        </Card>
      ) : (
        <Card>
          <SectionLabel>Proposed rank (edit before approving)</SectionLabel>
          <Field label="Name" value={rank.name} onChangeText={v => setRank(r => ({ ...r, name: v }))} editable={open} />
          <Field
            testID="rank-code-input"
            label="Code (becomes the rank's login)"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            placeholder="Leave empty to generate"
            editable={open}
          />
          <Field label="Address" value={rank.address} onChangeText={v => setRank(r => ({ ...r, address: v }))} editable={open} />
          <Field label="City" value={rank.city} onChangeText={v => setRank(r => ({ ...r, city: v }))} editable={open} />
          <Field label="Province" value={rank.province} onChangeText={v => setRank(r => ({ ...r, province: v }))} editable={open} />
          <Text style={styles.meta}>
            {[
              app.proposedRank?.operatingHours && `Hours ${app.proposedRank.operatingHours}`,
              app.proposedRank?.capacity && `Capacity ${app.proposedRank.capacity}`,
              app.proposedRank?.latitude != null && `Pin ${app.proposedRank.latitude}, ${app.proposedRank.longitude}`,
            ].filter(Boolean).join(' · ')}
          </Text>
        </Card>
      )}

      {action ? (
        <Card style={styles.action}>
          <Field
            testID="note-input"
            label={action === 'reject' ? 'Reason (shown to the applicant)' : 'Message to the applicant'}
            value={note}
            onChangeText={setNote}
            multiline
          />
          <Button
            testID="send-note-button"
            title={action === 'reject' ? 'Reject application' : 'Send request'}
            variant={action === 'reject' ? 'danger' : 'info'}
            onPress={sendNote}
            loading={busy}
          />
          <Button title="Cancel" variant="link" onPress={() => setAction(null)} />
        </Card>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted },
  quote: { fontSize: 14, lineHeight: 21, color: '#3f3f3f' },
  action: { borderWidth: 2, borderColor: colors.info },
});

export default ApplicationReviewScreen;
