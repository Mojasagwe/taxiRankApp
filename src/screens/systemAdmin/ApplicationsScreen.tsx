import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/api/applications';
import { Application } from '../../types/applications';
import { Button, Chip, EmptyState, Segmented } from '../../components/ui';
import { STATUS_LABEL, STATUS_TONE } from '../commuter/applicationStatus';
import AdminTabs from './AdminTabs';
import { colors } from '../../theme';

type Filter = 'open' | 'decided' | 'all';

const ago = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
};

const ApplicationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SystemAdminStackParamList>>();
  const { logout } = useAuth();
  const [filter, setFilter] = useState<Filter>('open');
  const [items, setItems] = useState<Application[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await applicationService.list(filter));
    } catch {
      setItems([]);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>System Administrator</Text>
          <Text accessibilityRole="header" style={styles.title}>Applications</Text>
        </View>
        <Button title="Log out" variant="link" onPress={logout} />
      </View>
      <View style={styles.filters}>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'decided', label: 'Decided' },
            { value: 'all', label: 'All' },
          ]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {items && items.length === 0 ? <EmptyState>No applications here</EmptyState> : null}
        {items?.map(app => (
          <TouchableOpacity
            key={app.id}
            testID={`application-${app.id}`}
            accessibilityRole="button"
            onPress={() => navigation.navigate('ApplicationReview', { id: app.id })}
            style={styles.item}
          >
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.rank}>{app.rank?.name ?? app.proposedRank?.name}</Text>
                <Text style={styles.applicant}>{app.applicant.name} · {app.designation}</Text>
              </View>
              <Chip label={STATUS_LABEL[app.status]} tone={STATUS_TONE[app.status]} />
            </View>
            <View style={styles.row}>
              <Chip label={app.rank ? 'Existing rank' : 'New rank'} tone={app.rank ? 'neutral' : 'dark'} />
              <Text style={styles.meta}>{ago(app.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <AdminTabs current="Applications" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 20 },
  subtitle: { fontSize: 13, fontWeight: '600', color: colors.textSubtle },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  filters: { paddingHorizontal: 20, paddingVertical: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  item: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1, gap: 3 },
  rank: { fontSize: 16, fontWeight: '700', color: colors.text },
  applicant: { fontSize: 13, color: colors.textMuted },
  meta: { fontSize: 12, color: colors.textSubtle },
});

export default ApplicationsScreen;
