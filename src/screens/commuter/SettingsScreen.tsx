import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { myAccountService } from '../../services/api/account';
import { apiError } from '../../services/api/axios';
import { NotificationSettings } from '../../types/trips';
import { Banner, Button, Card, Group, ListRow, Loading, Screen, SectionLabel, SwitchRow } from '../../components/ui';
import { colors } from '../../theme';

const TOGGLES: { key: keyof NotificationSettings; title: string; subtitle: string }[] = [
  { key: 'applicationUpdates', title: 'Application updates', subtitle: 'When your rank admin application changes status' },
  { key: 'rankChanges', title: 'Changes at my ranks', subtitle: 'Hours, fares or closures at ranks in your trips' },
  { key: 'news', title: 'Travy news', subtitle: 'New features and new ranks near you' },
];

/** R5: notification preferences, privacy summary and the way to delete the account */
const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = async () => {
    setLoadError(null);
    try {
      setSettings(await myAccountService.notifications());
    } catch (e) {
      setLoadError(apiError(e, 'Could not load your settings'));
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Switches flip at once; if saving fails they flip back and say so
  const toggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;
    const previous = settings;
    const next = { ...settings, [key]: value };
    setSettings(next);
    setSaveError(null);
    try {
      setSettings(await myAccountService.updateNotifications(next));
    } catch (e) {
      setSettings(previous);
      setSaveError(apiError(e, 'Could not save that change'));
    }
  };

  return (
    <Screen title="Account settings" onBack={navigation.goBack}>
      <SectionLabel>Notifications</SectionLabel>
      {loadError ? (
        <>
          <Banner tone="danger">{loadError}</Banner>
          <Button title="Try again" variant="secondary" onPress={load} />
        </>
      ) : !settings ? (
        <Loading />
      ) : (
        <Group>
          {TOGGLES.map((t, i) => (
            <SwitchRow
              key={t.key}
              title={t.title}
              subtitle={t.subtitle}
              value={settings[t.key]}
              onValueChange={value => toggle(t.key, value)}
              last={i === TOGGLES.length - 1}
            />
          ))}
        </Group>
      )}
      {saveError ? <Banner tone="danger">{saveError}</Banner> : null}
      <Text style={styles.note}>Your choices are saved now. Phone notifications start once Travy runs on AWS.</Text>

      <SectionLabel>Privacy</SectionLabel>
      <Card>
        <Text style={styles.cardTitle}>How Travy uses your data</Text>
        <Text style={styles.note}>
          We keep your name, contact details, photo and trips to run your account. We don't sell them. You can delete your account at
          any time.
        </Text>
      </Card>

      <Text style={[styles.dangerLabel]}>DANGER ZONE</Text>
      <Group style={styles.dangerGroup}>
        <ListRow
          testID="row-delete-account"
          title="Delete my account"
          subtitle="Permanently removes your details, photo and trips"
          tone="danger"
          onPress={() => navigation.navigate('DeleteAccount')}
          last
        />
      </Group>
    </Screen>
  );
};

const styles = StyleSheet.create({
  note: { fontSize: 13, lineHeight: 19, color: colors.textSubtle },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  dangerLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, color: colors.danger, marginTop: 8 },
  dangerGroup: { borderWidth: 1, borderColor: '#f3c4c4' },
});

export default SettingsScreen;
