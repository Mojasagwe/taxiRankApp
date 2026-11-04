import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { tripService } from '../../services/api/trips';
import { apiError } from '../../services/api/axios';
import { openWalkingDirections } from '../../services/directions';
import { RouteLeg } from '../../types/journeys';
import { Banner, Button, Card, Screen } from '../../components/ui';
import { formatFare, toLocalDateTime } from './tripFormat';
import { clockIn, formatClock, formatDistance, formatDuration, isPast } from './journeyFormat';
import { colors } from '../../theme';

const legWait = (leg: RouteLeg) => leg.typicalWaitNow ?? leg.intervalMinutes ?? 0;
// Same allowance the backend uses for walking between bays and catching the next taxi
const CHANGE_MINUTES = 15;

/** H6: walk, taxi, change ranks, taxi; with the time to leave by to catch the last connecting taxi */
const ConnectingRouteScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const { option, place } = useRoute<RouteProp<CommuterStackParamList, 'ConnectingRoute'>>().params;
  const { rank, firstLeg, changeAt, secondLeg } = option;
  const [error, setError] = useState<string | null>(null);
  const [planning, setPlanning] = useState(false);

  // Clock times along the way, from now
  const atFirstRank = option.walkMinutes;
  const firstLeaves = atFirstRank + legWait(firstLeg);
  const atChange = firstLeg.travelMinutes != null ? firstLeaves + firstLeg.travelMinutes : null;
  const secondLeaves = atChange != null ? atChange + Math.max(legWait(secondLeg), 3) : null;
  const arrive = secondLeaves != null && secondLeg.travelMinutes != null ? secondLeaves + secondLeg.travelMinutes : null;
  const leaveBy = formatClock(option.leaveBy);

  const steps = [
    { time: clockIn(0), kind: 'you', title: 'Your location', detail: `Walk ${formatDistance(option.walkKm)} to ${rank.name} · ${option.walkMinutes} min`, fare: '' },
    {
      time: clockIn(firstLeaves),
      kind: 'taxi',
      title: rank.name,
      detail: [firstLeg.bay, `taxi to ${changeAt.name}`, firstLeg.travelTime && `ride ${firstLeg.travelTime}`].filter(Boolean).join(' · '),
      fare: formatFare(firstLeg.fare),
    },
    {
      time: atChange != null ? clockIn(atChange) : '',
      kind: 'change',
      title: `Change at ${changeAt.name}`,
      detail: [secondLeg.bay, `taxi to ${secondLeg.destination}`, secondLeg.travelTime && `ride ${secondLeg.travelTime}`].filter(Boolean).join(' · '),
      fare: formatFare(secondLeg.fare),
      note: secondLeg.lastTaxiToday ? `Last taxi usually ${formatClock(secondLeg.lastTaxiToday)}` : undefined,
    },
    { time: arrive != null ? clockIn(arrive) : '', kind: 'end', title: place.name, detail: arrive != null ? `Arrive about ${clockIn(arrive)}` : '', fare: '' },
  ];

  const plan = async () => {
    setPlanning(true);
    setError(null);
    try {
      await tripService.log({ terminalId: firstLeg.terminalId, status: 'PLANNED', tripDate: toLocalDateTime(new Date(Date.now() + firstLeaves * 60000)) });
      if (atChange != null) {
        await tripService.log({ terminalId: secondLeg.terminalId, status: 'PLANNED', tripDate: toLocalDateTime(new Date(Date.now() + (atChange + CHANGE_MINUTES) * 60000)) });
      }
      Alert.alert('Trip planned', 'Both taxis are in your trips.');
    } catch (e) {
      setError(apiError(e, 'Could not plan the trip'));
    } finally {
      setPlanning(false);
    }
  };

  return (
    <Screen
      subtitle={`To ${place.name} · 1 change`}
      title={`${formatFare(option.totalFare)}${option.totalMinutes ? ` · about ${formatDuration(option.totalMinutes)}` : ''}`}
      onBack={navigation.goBack}
      footer={
        <View style={styles.footer}>
          <Button title="Plan this trip" variant="secondary" onPress={plan} loading={planning} style={styles.flex} />
          <Button title={`To ${rank.name.split(' ')[0]}`} onPress={() => openWalkingDirections(rank)} style={styles.flexWide} />
        </View>
      }
    >
      {leaveBy ? (
        <Banner tone={isPast(option.leaveBy) ? 'danger' : 'alert'} title={isPast(option.leaveBy) ? 'Too late to make this trip today' : `Leave by ${leaveBy}`}>
          {isPast(option.leaveBy)
            ? `The last taxi from ${changeAt.name} to ${secondLeg.destination} usually goes at ${formatClock(secondLeg.lastTaxiToday)}, and you'd get there after it.${firstLeg.firstTaxi ? ` First taxi tomorrow from ${formatClock(firstLeg.firstTaxi)}.` : ''}`
            : `The last taxi from ${changeAt.name} to ${secondLeg.destination} usually goes at ${formatClock(secondLeg.lastTaxiToday)}.`}
        </Banner>
      ) : null}
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <Card>
        {steps.map((s, i) => (
          <View key={s.title} style={styles.step} accessible accessibilityLabel={`${s.time} ${s.title}. ${s.detail}. ${s.fare}`}>
            <View style={styles.rail}>
              <Text style={styles.time}>{s.time}</Text>
              <View style={[styles.dot, styles[s.kind as 'you' | 'taxi' | 'change' | 'end']]} />
              {i < steps.length - 1 ? <View style={[styles.line, s.kind === 'you' && styles.walkLine]} /> : null}
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              {s.detail ? <Text style={styles.detail}>{s.detail}</Text> : null}
              {s.note ? <Text style={styles.note}>{s.note}</Text> : null}
            </View>
            <Text style={styles.stepFare}>{s.fare}</Text>
          </View>
        ))}
      </Card>
      <Text style={styles.source}>Times are typical for today from riders' trips. Fares are set by each rank.</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  flexWide: { flex: 1.4 },
  step: { flexDirection: 'row', gap: 12 },
  rail: { width: 46, alignItems: 'center' },
  time: { fontSize: 13, fontWeight: '700', color: colors.text },
  dot: { width: 12, height: 12, marginTop: 6, marginBottom: 4 },
  you: { borderRadius: 6, backgroundColor: colors.info },
  taxi: { borderRadius: 6, backgroundColor: colors.ink },
  change: { borderRadius: 6, borderWidth: 3, borderColor: colors.ink, backgroundColor: colors.surface },
  end: { borderRadius: 3, backgroundColor: colors.gold },
  line: { flex: 1, width: 2, minHeight: 24, backgroundColor: colors.ink },
  walkLine: { backgroundColor: '#d6d4ce' },
  stepBody: { flex: 1, gap: 4, paddingBottom: 16 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  detail: { fontSize: 13, lineHeight: 19, color: '#3f3f3f' },
  note: { alignSelf: 'flex-start', fontSize: 12, fontWeight: '700', color: colors.alert, backgroundColor: colors.alertBg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  stepFare: { fontSize: 15, fontWeight: '800', color: colors.text },
  source: { fontSize: 12, lineHeight: 18, color: colors.textSubtle, paddingHorizontal: 4 },
});

export default ConnectingRouteScreen;
