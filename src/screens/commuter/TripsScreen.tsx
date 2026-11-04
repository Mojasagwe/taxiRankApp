import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { tripService } from '../../services/api/trips';
import { apiError } from '../../services/api/axios';
import { Trip, TripStatus } from '../../types/trips';
import { Banner, Button, EmptyState, Loading, Screen, Segmented } from '../../components/ui';
import { TripCard } from '../../components/rider';
import { formatFare, groupByMonth } from './tripFormat';
import { colors } from '../../theme';

type Filter = 'ALL' | TripStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'TAKEN', label: 'Taken' },
  { value: 'PLANNED', label: 'Planned' },
];

/** R4: trips taken or planned, grouped by month with what was spent */
const TripsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setTrips(await tripService.list());
    } catch (e) {
      setError(apiError(e, 'Could not load your trips'));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const months = useMemo(
    () => groupByMonth((trips ?? []).filter(t => filter === 'ALL' || t.status === filter)),
    [trips, filter],
  );

  const run = async (trip: Trip, action: () => Promise<unknown>) => {
    setBusyId(trip.id);
    setActionError(null);
    try {
      await action();
      await load();
    } catch (e) {
      setActionError(apiError(e, 'Could not update that trip'));
    } finally {
      setBusyId(null);
    }
  };

  const again = (trip: Trip) => {
    if (!trip.terminalId) {
      setActionError(`${trip.rank.name} no longer runs to ${trip.destination}.`);
      return;
    }
    Alert.alert('Do it again?', `Log a trip from ${trip.rank.name} to ${trip.destination} today. The fare is the rank's current fare.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log trip', onPress: () => run(trip, () => tripService.log({ terminalId: trip.terminalId!, status: 'TAKEN' })) },
    ]);
  };

  const remove = (trip: Trip) =>
    Alert.alert('Remove this trip?', `${trip.rank.name} to ${trip.destination}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => run(trip, () => tripService.remove(trip.id)) },
    ]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const logTrip = <Button testID="log-trip" title="Log a trip" variant="link" onPress={() => navigation.navigate('LogTrip')} />;

  return (
    <Screen title="My trips" tabbed right={logTrip} refreshing={refreshing} onRefresh={refresh}>
      <Segmented options={FILTERS} value={filter} onChange={setFilter} />
      {actionError ? <Banner tone="danger">{actionError}</Banner> : null}
      {error ? (
        <>
          <Banner tone="danger">{error}</Banner>
          <Button title="Try again" variant="secondary" onPress={load} />
        </>
      ) : trips === null ? (
        <Loading />
      ) : months.length === 0 ? (
        <View style={styles.empty}>
          <EmptyState>
            {filter === 'ALL' ? 'No trips yet. Log a trip from a rank to keep track of where you go and what you spend.' : `No ${filter === 'TAKEN' ? 'taken' : 'planned'} trips.`}
          </EmptyState>
          {filter === 'ALL' ? <Button title="Log your first trip" onPress={() => navigation.navigate('LogTrip')} /> : null}
        </View>
      ) : (
        months.map(month => (
          <View key={month.key} style={styles.month}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle} accessibilityRole="header">{month.title}</Text>
              {month.spent > 0 ? <Text style={styles.monthSpent}>{formatFare(month.spent)} spent</Text> : null}
            </View>
            {month.trips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                actionLabel={trip.status === 'TAKEN' ? 'Do it again' : 'I took it'}
                onAction={() => (trip.status === 'TAKEN' ? again(trip) : run(trip, () => tripService.markTaken(trip.id)))}
                onRemove={() => remove(trip)}
                busy={busyId === trip.id}
              />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  empty: { gap: 8 },
  month: { gap: 10 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 8, paddingHorizontal: 4 },
  monthTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, color: colors.textSubtle },
  monthSpent: { fontSize: 13, color: colors.textSubtle },
});

export default TripsScreen;
