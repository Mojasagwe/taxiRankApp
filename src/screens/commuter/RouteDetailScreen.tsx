import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { journeyService } from '../../services/api/journeys';
import { tripService } from '../../services/api/trips';
import { apiError } from '../../services/api/axios';
import { openWalkingDirections } from '../../services/directions';
import { RouteInsights } from '../../types/journeys';
import { Banner, Button, Card, Chip, FactGrid, Screen, SectionLabel } from '../../components/ui';
import { WaitChart } from '../../components/journey';
import { formatFare, toLocalDateTime } from './tripFormat';
import { clockIn, formatClock, formatDistance } from './journeyFormat';
import { colors } from '../../theme';

/** H4: one rank's taxi to the destination: fare, wait trend, last taxi, directions, start the trip */
const RouteDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const { option } = useRoute<RouteProp<CommuterStackParamList, 'RouteDetail'>>().params;
  const { rank, route } = option;
  const [insights, setInsights] = useState<RouteInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'plan' | 'start' | null>(null);

  useEffect(() => {
    journeyService
      .insights(rank.id, route.terminalId)
      .then(setInsights)
      .catch(() => setInsights(null)); // the rank's own details still show
  }, [rank.id, route.terminalId]);

  const wait = route.typicalWaitNow ?? route.intervalMinutes ?? 0;
  const arrive = route.travelMinutes != null ? clockIn(option.walkMinutes + wait + route.travelMinutes) : '—';
  const lastByRank = formatClock(route.lastTaxiToday);
  const latestSeen = formatClock(insights?.latestDepartureSeen ?? route.latestDepartureSeen);

  const plan = async () => {
    setBusy('plan');
    setError(null);
    try {
      const when = new Date(Date.now() + option.walkMinutes * 60000);
      await tripService.log({ terminalId: route.terminalId, status: 'PLANNED', tripDate: toLocalDateTime(when) });
      Alert.alert('Trip planned', `${rank.name} to ${route.destination} is in your trips.`);
    } catch (e) {
      setError(apiError(e, 'Could not plan the trip'));
    } finally {
      setBusy(null);
    }
  };

  const start = async () => {
    setBusy('start');
    setError(null);
    try {
      await tripService.start(route.terminalId);
      navigation.navigate('ActiveTrip');
    } catch (e: any) {
      if (e?.response?.status === 409) {
        navigation.navigate('ActiveTrip'); // already in a taxi: show that trip
      } else {
        setError(apiError(e, 'Could not start the trip'));
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen
      title={rank.name}
      subtitle={`${formatDistance(option.walkKm)} · ${option.walkMinutes} min walk`}
      onBack={navigation.goBack}
      footer={
        <View style={styles.footer}>
          <Button title="Plan this trip" variant="secondary" onPress={plan} loading={busy === 'plan'} style={styles.flex} />
          <Button
            testID="directions"
            title="Directions"
            onPress={() => openWalkingDirections(rank)}
            style={styles.flexWide}
          />
        </View>
      }
    >
      {error ? <Banner tone="danger">{error}</Banner> : null}
      {rank.address ? <Text style={styles.address}>{rank.address}</Text> : null}

      <Card>
        <SectionLabel>Your taxi</SectionLabel>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.destination}>{route.destination}</Text>
            {route.bay ? <Text style={styles.bay}>{route.bay}</Text> : null}
          </View>
          <Text style={styles.fare}>{formatFare(route.fare)}</Text>
        </View>
        <View style={styles.divider} />
        <FactGrid
          facts={[
            { label: 'Ride', value: route.travelTime ?? '—' },
            { label: 'Leaves', value: route.typicalWaitNow != null ? `~${route.typicalWaitNow} min` : '—' },
            { label: 'Arrive about', value: arrive },
          ]}
        />
        <View style={styles.divider} />
        <View style={styles.chips}>
          <Chip label={route.runningToday ? 'Running today' : 'Not running today'} tone={route.runningToday ? 'success' : 'danger'} />
          {route.intervalMinutes ? <Text style={styles.rankSays}>Rank says: a taxi about every {route.intervalMinutes} min</Text> : null}
        </View>
      </Card>

      {insights && insights.hours.some(h => h.typicalWaitMinutes != null) ? (
        <Card>
          <SectionLabel>How long until it leaves</SectionLabel>
          <WaitChart hours={insights.hours} nowHour={new Date().getHours()} destination={route.destination} />
          <Text style={styles.source}>
            From {insights.riderTrips} rider trips on {insights.dayType === 'WEEKDAY' ? 'weekdays' : insights.dayType === 'SATURDAY' ? 'Saturdays' : 'Sundays'} in the last 4 weeks. Tap a bar for that hour.
          </Text>
        </Card>
      ) : (
        <Card>
          <SectionLabel>How long until it leaves</SectionLabel>
          <Text style={styles.body}>Not enough riders have timed this taxi yet. Start your trip when you get in to help.</Text>
        </Card>
      )}

      <Card>
        <Text style={styles.lastTitle}>{lastByRank ? `Last taxi usually ${lastByRank}` : 'Last taxi: the rank hasn’t said'}</Text>
        {latestSeen && latestSeen !== lastByRank ? (
          <Text style={styles.body}>Riders saw one as late as {latestSeen}.</Text>
        ) : null}
      </Card>

      <Button testID="start-trip" title="Already in the taxi? Start your trip" variant="link" onPress={start} loading={busy === 'start'} />
      <Text style={styles.source}>Wait times come from riders' trips. Fare, how often taxis leave and the last taxi are set by {rank.name}.</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  flexWide: { flex: 1.4 },
  address: { fontSize: 14, color: colors.textSubtle, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  destination: { fontSize: 18, fontWeight: '800', color: colors.text },
  bay: { fontSize: 14, color: '#3f3f3f', marginTop: 3 },
  fare: { fontSize: 24, fontWeight: '800', color: colors.text },
  divider: { height: 1, backgroundColor: '#f0efeb', marginVertical: 4 },
  chips: { gap: 8 },
  rankSays: { fontSize: 13, color: '#3f3f3f' },
  lastTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, lineHeight: 20, color: colors.textMuted },
  source: { fontSize: 12, lineHeight: 18, color: colors.textSubtle, paddingHorizontal: 4 },
});

export default RouteDetailScreen;
