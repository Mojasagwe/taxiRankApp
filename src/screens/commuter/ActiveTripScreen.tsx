import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { tripService } from '../../services/api/trips';
import { apiError } from '../../services/api/axios';
import { Trip } from '../../types/trips';
import { Banner, Button, EmptyState, FactGrid, Loading, Screen } from '../../components/ui';
import { formatFare } from './tripFormat';
import { colors, radius } from '../../theme';

const clock = (iso?: string) => (iso ? iso.slice(11, 16) : '—');
const minutesSince = (iso: string, now: number) => Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));

/** H7: the rider is in the taxi. Their taps tell other riders how long this route takes to leave. */
const ActiveTripScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    try {
      setTrip(await tripService.active());
    } catch (e) {
      setError(apiError(e, 'Could not load your trip'));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Keep "4 min so far" current
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const act = async (action: () => Promise<Trip>) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await action();
      if (updated.status === 'TAKEN') {
        navigation.replace('TripQuestions', { trip: updated });
      } else {
        setTrip(updated);
      }
    } catch (e) {
      setError(apiError(e, 'Could not save that'));
    } finally {
      setBusy(false);
    }
  };

  const cancel = () =>
    Alert.alert('Cancel this trip?', "It won't be saved or counted.", [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel trip',
        style: 'destructive',
        onPress: async () => {
          try {
            await tripService.remove(trip!.id);
            navigation.goBack();
          } catch (e) {
            setError(apiError(e, 'Could not cancel the trip'));
          }
        },
      },
    ]);

  if (trip === undefined && !error) {
    return (
      <Screen title="Your trip" onBack={navigation.goBack}>
        <Loading />
      </Screen>
    );
  }
  if (!trip) {
    return (
      <Screen title="Your trip" onBack={navigation.goBack}>
        {error ? <Banner tone="danger">{error}</Banner> : <EmptyState>No trip in progress.</EmptyState>}
      </Screen>
    );
  }

  const moving = !!trip.departedAt;
  const waited = trip.boardedAt && trip.departedAt ? minutesSince(trip.boardedAt, new Date(trip.departedAt).getTime()) : null;

  return (
    <Screen title="Your trip" onBack={navigation.goBack}>
      <View style={styles.ticket} accessible accessibilityLabel={`${moving ? 'On the way' : 'Filling up'}: ${trip.rank.name} to ${trip.destination}, ${formatFare(trip.fare)}`}>
        <Text style={[styles.status, moving && styles.statusMoving]}>
          {moving ? 'ON THE WAY' : `FILLING UP · ${minutesSince(trip.boardedAt!, now)} MIN SO FAR`}
        </Text>
        <View style={styles.route}>
          <View style={styles.flex}>
            <Text style={styles.from}>{trip.rank.name}{trip.bay ? ` · ${trip.bay}` : ''}</Text>
            <Text style={styles.to}>{trip.destination}</Text>
          </View>
          <Text style={styles.fare}>{formatFare(trip.fare)}</Text>
        </View>
        <View style={styles.rule} />
        <FactGrid
          inverted
          facts={[
            { label: 'In the taxi', value: clock(trip.boardedAt) },
            { label: 'Left the rank', value: moving ? clock(trip.departedAt) : '—' },
            { label: 'Waited', value: waited != null ? `${waited} min` : '—' },
          ]}
        />
      </View>

      {error ? <Banner tone="danger">{error}</Banner> : null}
      <Text style={styles.prompt}>
        {moving
          ? "Tap when you get off, and we'll add the trip to your history."
          : 'Tap the moment the taxi pulls off. It tells other riders how long taxis on this route take to leave.'}
      </Text>
      <Button
        testID={moving ? 'arrived' : 'departed'}
        title={moving ? "I've arrived" : "We've left the rank"}
        onPress={() => act(() => (moving ? tripService.arrived(trip.id) : tripService.departed(trip.id)))}
        loading={busy}
        style={styles.big}
      />
      {moving ? null : <Button title="I got out, cancel this trip" variant="link" onPress={cancel} />}
      <Text style={styles.privacy}>
        Travy saves when you got in and when the taxi left, for your trip history. Other riders only ever see averages, never your trips.
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  ticket: { backgroundColor: colors.ink, borderRadius: 20, padding: 20, gap: 14 },
  status: { alignSelf: 'flex-start', fontSize: 12, fontWeight: '800', color: colors.ink, backgroundColor: '#f5f5f0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  statusMoving: { backgroundColor: colors.gold },
  route: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1, gap: 10 },
  from: { fontSize: 15, fontWeight: '600', color: '#f5f5f0' },
  to: { fontSize: 18, fontWeight: '800', color: '#f5f5f0' },
  fare: { fontSize: 22, fontWeight: '800', color: colors.gold },
  rule: { height: 1, backgroundColor: '#3a3a3a' },
  prompt: { fontSize: 15, lineHeight: 22, color: colors.text, paddingHorizontal: 4 },
  big: { minHeight: 60, borderRadius: radius.lg },
  privacy: { fontSize: 13, lineHeight: 19, color: colors.textSubtle, paddingHorizontal: 4 },
});

export default ActiveTripScreen;
