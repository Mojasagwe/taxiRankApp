import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../navigation/CommuterNavigator';
import { useAuth } from '../context/AuthContext';
import { rankService } from '../services/api/ranks';
import { applicationService } from '../services/api/applications';
import { Application } from '../types/applications';
import { Rank } from '../types/admin';
import { Button, Card, Chip, EmptyState, Screen, SectionLabel } from '../components/ui';
import { STATUS_LABEL, STATUS_TONE } from './commuter/applicationStatus';
import { colors } from '../theme';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const { user, logout, can } = useAuth();
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [latest, setLatest] = useState<Application | null>(null);

  useFocusEffect(
    useCallback(() => {
      rankService.list().then(setRanks).catch(() => setRanks([]));
      if (can('APPLICATIONS_SUBMIT')) {
        applicationService.mine().then(apps => setLatest(apps[0] ?? null)).catch(() => setLatest(null));
      }
    }, [can]),
  );

  return (
    <Screen
      subtitle="Travy"
      title={`Hi, ${user?.firstName ?? 'there'}`}
      right={<Button title="Log out" variant="link" onPress={logout} />}
    >
      <SectionLabel>Taxi ranks</SectionLabel>
      {ranks.length === 0 ? (
        <EmptyState>No ranks to show yet</EmptyState>
      ) : (
        ranks.filter(r => r.isActive).map(rank => (
          <Card key={rank.id}>
            <Text style={styles.rankName}>{rank.name}</Text>
            <Text style={styles.meta}>
              {[rank.city, rank.province].filter(Boolean).join(' · ')}
              {rank.operatingHours ? `  ·  ${rank.operatingHours}` : ''}
            </Text>
            <Text style={styles.address}>{rank.address}</Text>
          </Card>
        ))
      )}

      {can('APPLICATIONS_SUBMIT') ? (
        <Card style={styles.applyCard}>
          <Text style={styles.applyTitle}>Run a taxi rank?</Text>
          {latest ? (
            <View style={styles.row}>
              <Text style={styles.applyText}>
                Your application for {latest.rank?.name ?? latest.proposedRank?.name}
              </Text>
              <Chip label={STATUS_LABEL[latest.status]} tone={STATUS_TONE[latest.status]} />
            </View>
          ) : (
            <Text style={styles.applyText}>Apply to manage its information for riders on Travy.</Text>
          )}
          <Button
            testID="apply-entry"
            title={latest ? 'View my application' : 'Apply to manage a rank'}
            onPress={() => (latest ? navigation.navigate('MyApplication') : navigation.navigate('Apply'))}
          />
        </Card>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  rankName: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textSubtle },
  address: { fontSize: 14, color: colors.textMuted },
  applyCard: { borderWidth: 1, borderColor: colors.gold },
  applyTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  applyText: { fontSize: 14, color: colors.textMuted, flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

export default HomeScreen;
