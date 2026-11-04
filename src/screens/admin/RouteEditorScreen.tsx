import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RankAdminStackParamList } from '../../navigation/RankAdminNavigator';
import { adminService } from '../../services/api/admin';
import { rankService } from '../../services/api/ranks';
import { apiError } from '../../services/api/axios';
import { Rank, TaxiTerminal } from '../../types/admin';
import { Banner, Button, ChoiceRow, Field, Group, Screen, SectionLabel, Segmented, SwitchRow } from '../../components/ui';
import { colors } from '../../theme';

const INTERVALS = ['5', '10', '15', '20', '30'].map(v => ({ value: v, label: `${v} min` }));
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const hhmm = (t?: string | null) => (t ? t.slice(0, 5) : '');

/**
 * H9: a rank admin sets how a route runs: fare, bay, running today, how often taxis leave,
 * first and last taxi, and where it ends. Answers riders' fare reports too.
 */
const RouteEditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const { rankId, terminal } = useRoute<RouteProp<RankAdminStackParamList, 'RouteEditor'>>().params;
  const [current, setCurrent] = useState<TaxiTerminal | undefined>(terminal);
  const [name, setName] = useState(terminal?.name ?? '');
  const [fare, setFare] = useState(terminal ? String(terminal.fare) : '');
  const [bay, setBay] = useState(terminal?.bay ?? '');
  const [travelTime, setTravelTime] = useState(terminal?.travelTime ?? '');
  const [distance, setDistance] = useState(terminal?.distance ?? '');
  const [running, setRunning] = useState(terminal?.runningToday ?? true);
  const [interval, setIntervalMinutes] = useState(terminal?.intervalMinutes ? String(terminal.intervalMinutes) : '');
  const [firstTaxi, setFirstTaxi] = useState(hhmm(terminal?.firstTaxi));
  const [lastWeekday, setLastWeekday] = useState(hhmm(terminal?.lastTaxiWeekday));
  const [lastSaturday, setLastSaturday] = useState(hhmm(terminal?.lastTaxiSaturday));
  const [lastSunday, setLastSunday] = useState(hhmm(terminal?.lastTaxiSunday));
  const [endsAt, setEndsAt] = useState<number | null>(terminal?.endsAtRankId ?? null);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [answering, setAnswering] = useState(false);

  useEffect(() => {
    rankService.list().then(all => setRanks(all.filter(r => r.id !== rankId && r.isActive))).catch(() => setRanks([]));
  }, [rankId]);

  const answerFareReport = async (newFare?: number) => {
    if (!current) return;
    setAnswering(true);
    setError(null);
    try {
      const updated = await adminService.confirmFare(rankId, current.id, newFare);
      setCurrent({ ...updated, fareReport: null });
      setFare(String(updated.fare));
    } catch (e) {
      setError(apiError(e, 'Could not update the fare'));
    } finally {
      setAnswering(false);
    }
  };

  const save = async () => {
    const found: Record<string, string> = {};
    if (!name.trim()) found.name = 'Where does this route go?';
    if (!(Number(fare) > 0)) found.fare = 'Enter the fare in rand';
    if (!travelTime.trim()) found.travelTime = 'e.g. 40 min or 1 h 10 min';
    if (!distance.trim()) found.distance = 'e.g. 25 km';
    ([['firstTaxi', firstTaxi], ['lastWeekday', lastWeekday], ['lastSaturday', lastSaturday], ['lastSunday', lastSunday]] as const)
      .filter(([, v]) => v && !TIME.test(v))
      .forEach(([key]) => (found[key] = 'Use 24-hour time, e.g. 19:30'));
    setErrors(found);
    if (Object.keys(found).length) return;

    // The server stores the full set, so send every field (blank clears it)
    const payload: Partial<TaxiTerminal> = {
      name: name.trim(),
      fare: Number(fare),
      travelTime: travelTime.trim(),
      distance: distance.trim(),
      bay: bay.trim() || null,
      runningToday: running,
      intervalMinutes: interval ? Number(interval) : null,
      firstTaxi: firstTaxi || null,
      lastTaxiWeekday: lastWeekday || null,
      lastTaxiSaturday: lastSaturday || null,
      lastTaxiSunday: lastSunday || null,
      endsAtRankId: endsAt,
      destinationLatitude: current?.destinationLatitude ?? null,
      destinationLongitude: current?.destinationLongitude ?? null,
      destinationPlaceId: current?.destinationPlaceId ?? null,
    };
    setSaving(true);
    setError(null);
    const result = current
      ? await adminService.updateTerminal(rankId, current.id, payload)
      : await adminService.addTerminal(rankId, payload);
    if (result.success) {
      navigation.goBack();
    } else {
      setError(result.error ?? 'Could not save the route');
      setSaving(false);
    }
  };

  const report = current?.fareReport;
  const hasPin = current?.destinationLatitude != null;
  const endsAtName = ranks.find(r => r.id === endsAt)?.name ?? current?.endsAtRankName;

  return (
    <Screen
      title={current ? `Route to ${current.name}` : 'New route'}
      onBack={navigation.goBack}
      footer={<Button testID="save-route" title="Save route" onPress={save} loading={saving} />}
    >
      {report ? (
        <Banner title={`${report.reports} riders paid R${report.reportedFare} this week`}>
          <View style={styles.reportBody}>
            <Text style={styles.reportText}>{`Your listed fare is R${current!.fare}. Has the fare changed?`}</Text>
            <View style={styles.reportActions}>
              <Button title={`Set fare to R${report.reportedFare}`} onPress={() => answerFareReport(report.reportedFare)} loading={answering} style={styles.flex} />
              <Button title={`Still R${current!.fare}`} variant="secondary" onPress={() => answerFareReport()} disabled={answering} style={styles.flex} />
            </View>
          </View>
        </Banner>
      ) : null}
      {error ? <Banner tone="danger">{error}</Banner> : null}

      <Group>
        <SwitchRow
          title={running ? 'Running today' : 'Paused today'}
          subtitle={running ? 'Riders see this route as available' : 'Riders see "Not running today"; it runs again tomorrow'}
          value={running}
          onValueChange={setRunning}
          last
        />
      </Group>

      <Field label="Destination" value={name} onChangeText={setName} error={errors.name} placeholder="e.g. Soweto · Bara" />
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Fare (R)" value={fare} onChangeText={setFare} error={errors.fare} keyboardType="decimal-pad" />
        </View>
        <View style={styles.flex}>
          <Field label="Bay or line" value={bay} onChangeText={setBay} placeholder="e.g. Bay 4" />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Ride time" value={travelTime} onChangeText={setTravelTime} error={errors.travelTime} placeholder="40 min" />
        </View>
        <View style={styles.flex}>
          <Field label="Distance" value={distance} onChangeText={setDistance} error={errors.distance} placeholder="25 km" />
        </View>
      </View>

      <SectionLabel>A taxi leaves about every</SectionLabel>
      <Segmented options={INTERVALS} value={interval} onChange={v => setIntervalMinutes(v === interval ? '' : v)} />

      <SectionLabel>First and last taxi</SectionLabel>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="First taxi" value={firstTaxi} onChangeText={setFirstTaxi} error={errors.firstTaxi} placeholder="05:00" keyboardType="numbers-and-punctuation" />
        </View>
        <View style={styles.flex}>
          <Field label="Last (Mon–Fri)" value={lastWeekday} onChangeText={setLastWeekday} error={errors.lastWeekday} placeholder="19:30" keyboardType="numbers-and-punctuation" />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Last (Sat)" value={lastSaturday} onChangeText={setLastSaturday} error={errors.lastSaturday} placeholder="18:00" keyboardType="numbers-and-punctuation" />
        </View>
        <View style={styles.flex}>
          <Field label="Last (Sun)" value={lastSunday} onChangeText={setLastSunday} error={errors.lastSunday} placeholder="none" keyboardType="numbers-and-punctuation" />
        </View>
      </View>

      <SectionLabel>Where it goes</SectionLabel>
      <Text style={styles.note}>
        {hasPin
          ? 'Map pin set.'
          : endsAtName
            ? `No map pin yet; riders find this route through ${endsAtName}'s location.`
            : 'No map pin yet. Setting the pin on the map comes with Google Maps; until then, choose the rank it ends at if there is one.'}
      </Text>
      <Text style={styles.label}>Ends at a rank (optional)</Text>
      <Group>
        <ChoiceRow title="Doesn't end at a rank" selected={endsAt === null} onPress={() => setEndsAt(null)} last={ranks.length === 0} />
        {ranks.map((r, i) => (
          <ChoiceRow
            key={r.id}
            title={r.name}
            subtitle={r.city}
            selected={endsAt === r.id}
            onPress={() => setEndsAt(r.id)}
            last={i === ranks.length - 1}
          />
        ))}
      </Group>
      <Text style={styles.note}>Lets Travy offer this route to riders going further, with a change there.</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  reportBody: { gap: 10 },
  reportText: { fontSize: 14, lineHeight: 20, color: colors.text },
  reportActions: { flexDirection: 'row', gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  note: { fontSize: 13, lineHeight: 19, color: colors.textSubtle },
});

export default RouteEditorScreen;
