import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { userAdminService } from '../../services/api/users';
import { User } from '../../types/auth';
import { Chip, EmptyState, Segmented } from '../../components/ui';
import { STATUS_LABEL as ACCOUNT_STATUS, STATUS_TONE as ACCOUNT_TONE } from './accountStatus';
import AdminTabs from './AdminTabs';
import { colors } from '../../theme';

type Filter = 'all' | 'RANK_ADMIN' | 'COMMUTER' | 'attention';

const initials = (name: string) => name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

const UsersScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SystemAdminStackParamList>>();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[] | null>(null);

  const load = useCallback(async () => {
    try {
      const profile = filter === 'RANK_ADMIN' || filter === 'COMMUTER' ? filter : undefined;
      const list = await userAdminService.list({ profile, q: query.trim() || undefined });
      setUsers(filter === 'attention' ? list.filter(u => u.accountStatus !== 'ACTIVE') : list);
    } catch {
      setUsers([]);
    }
  }, [filter, query]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>System Administrator</Text>
        <Text accessibilityRole="header" style={styles.title}>Users</Text>
      </View>
      <View style={styles.tools}>
        <TextInput
          accessibilityLabel="Search users"
          placeholder="Search name, email, phone or rank code"
          placeholderTextColor={colors.textSubtle}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          style={styles.search}
        />
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'RANK_ADMIN', label: 'Rank accounts' },
            { value: 'COMMUTER', label: 'Commuters' },
            { value: 'attention', label: 'Needs attention' },
          ]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {users && users.length === 0 ? <EmptyState>No users match</EmptyState> : null}
        {users?.map(u => (
          <TouchableOpacity
            key={u.id}
            testID={`user-${u.id}`}
            accessibilityRole="button"
            onPress={() => navigation.navigate('UserDetail', { id: u.id })}
            style={styles.item}
          >
            <View style={[styles.avatar, u.rank ? styles.avatarRank : null]}>
              <Text style={[styles.avatarText, u.rank ? styles.avatarTextRank : null]}>{initials(u.displayName)}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.name} numberOfLines={1}>{u.displayName}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {u.rank ? `${u.loginName} · responsible: ${u.responsiblePersonName ?? '—'}` : u.loginName}
              </Text>
            </View>
            <View style={styles.badges}>
              <Chip label={u.profileName} />
              {u.accountStatus !== 'ACTIVE' ? <Chip label={ACCOUNT_STATUS[u.accountStatus]} tone={ACCOUNT_TONE[u.accountStatus]} /> : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <AdminTabs current="Users" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  subtitle: { fontSize: 13, fontWeight: '600', color: colors.textSubtle },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  tools: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  search: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, backgroundColor: colors.surface, color: colors.text },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 14, padding: 12, minHeight: 64 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.chipNeutral, alignItems: 'center', justifyContent: 'center' },
  avatarRank: { borderRadius: 10, backgroundColor: colors.ink },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#3f3f3f' },
  avatarTextRank: { color: colors.gold },
  flex: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textSubtle },
  badges: { alignItems: 'flex-end', gap: 4 },
});

export default UsersScreen;
