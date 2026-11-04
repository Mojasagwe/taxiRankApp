import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { rankService } from '../../services/api/ranks';
import { tripService } from '../../services/api/trips';
import { apiError } from '../../services/api/axios';
import { Rank } from '../../types/admin';
import { Destination, TripStatus } from '../../types/trips';
import { Banner, Button, ChoiceRow, EmptyState, Field, Group, Loading, Screen, SectionLabel, Segmented } from '../../components/ui';
import { formatFare, toLocalDateTime } from './tripFormat';
import { colors } from '../../theme';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = [
  { value: '07', label: 'Morning' },
  { value: '12', label: 'Midday' },
  { value: '16', label: 'Afternoon' },
  { value: '19', label: 'Evening' },
];

const nextDays = (now = new Date()) =>
  Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return { value: String(i), label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${DAY_NAMES[day.getDay()]} ${day.getDate()}`, day };
  });

/**
 * Log a trip from a rank to one of its destinations. Until "Plan a trip" exists,
 * this is how trips get into the history. The fare comes from the rank.
 */
const LogTripScreen: React.FC = () => {
  const navigation = useNavigation();
  const [ranks, setRanks] = useState<Rank[] | null>(null);
  const [query, setQuery] = useState('');
  const [rank, setRank] = useState<Rank | null>(null);
  const [destinations, setDestinations] = useState<Destination[] | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [status, setStatus] = useState<TripStatus>('TAKEN');
  const [dayIndex, setDayIndex] = useState('0');
  const [hour, setHour] = useState('07');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const days = useMemo(() => nextDays(), []);

  useEffect(() => {
    rankService
      .list()
      .then(all => setRanks(all.filter(r => r.isActive)))
      .catch(e => setError(apiError(e, 'Could not load ranks')));
  }, []);

  useEffect(() => {
    setDestination(null);
    setDestinations(null);
    if (rank) {
      rankService
        .destinations(rank.id)
        .then(setDestinations)
        .catch(e => setError(apiError(e, 'Could not load destinations')));
    }
  }, [rank]);

  const shownRanks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (ranks ?? []).filter(r => !q || [r.name, r.city, r.address].some(v => v?.toLowerCase().includes(q)));
  }, [ranks, query]);

  const save = async () => {
    if (!destination) {
      setError('Choose where you went');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      let tripDate: string | undefined;
      if (status === 'PLANNED') {
        const day = days[Number(dayIndex)].day;
        tripDate = toLocalDateTime(new Date(day.getFullYear(), day.getMonth(), day.getDate(), Number(hour)));
      }
      await tripService.log({ terminalId: destination.id, status, tripDate });
      navigation.goBack();
    } catch (e) {
      setError(apiError(e, 'Could not save the trip'));
      setSaving(false);
    }
  };

  return (
    <Screen
      title="Log a trip"
      onBack={navigation.goBack}
      footer={<Button testID="save-trip" title="Save trip" onPress={save} loading={saving} disabled={!destination} />}
    >
      {error ? <Banner tone="danger">{error}</Banner> : null}

      <SectionLabel>From</SectionLabel>
      {rank ? (
        <Group>
          <ChoiceRow title={rank.name} subtitle={[rank.city, rank.address].filter(Boolean).join(' · ')} selected onPress={() => setRank(null)} last />
        </Group>
      ) : ranks === null ? (
        <Loading />
      ) : (
        <>
          <Field label="Search ranks" value={query} onChangeText={setQuery} placeholder="Rank name or area" />
          {shownRanks.length === 0 ? (
            <EmptyState>No ranks match</EmptyState>
          ) : (
            <Group>
              {shownRanks.map((r, i) => (
                <ChoiceRow
                  key={r.id}
                  title={r.name}
                  subtitle={[r.city, r.address].filter(Boolean).join(' · ')}
                  selected={false}
                  onPress={() => setRank(r)}
                  last={i === shownRanks.length - 1}
                />
              ))}
            </Group>
          )}
        </>
      )}
      {rank ? <Text style={styles.hint}>Tap the rank to choose another.</Text> : null}

      {rank ? (
        <>
          <SectionLabel>To</SectionLabel>
          {destinations === null ? (
            <Loading />
          ) : destinations.length === 0 ? (
            <EmptyState>This rank hasn't listed its destinations yet.</EmptyState>
          ) : (
            <Group>
              {destinations.map((d, i) => (
                <ChoiceRow
                  key={d.id}
                  title={d.name}
                  subtitle={[d.travelTime, d.distance].filter(Boolean).join(' · ')}
                  trailing={formatFare(d.fare)}
                  selected={destination?.id === d.id}
                  onPress={() => setDestination(d)}
                  last={i === destinations.length - 1}
                />
              ))}
            </Group>
          )}
        </>
      ) : null}

      {destination ? (
        <>
          <SectionLabel>When</SectionLabel>
          <Segmented
            options={[
              { value: 'TAKEN', label: 'I took it today' },
              { value: 'PLANNED', label: "I'm planning it" },
            ]}
            value={status}
            onChange={setStatus}
          />
          {status === 'PLANNED' ? (
            <>
              <Segmented options={days.map(d => ({ value: d.value, label: d.label }))} value={dayIndex} onChange={setDayIndex} />
              <Segmented options={TIMES} value={hour} onChange={setHour} />
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  hint: { fontSize: 13, color: colors.textSubtle },
});

export default LogTripScreen;
