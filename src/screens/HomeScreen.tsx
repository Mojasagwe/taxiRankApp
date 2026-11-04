import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../navigation/CommuterNavigator';
import { useAuth } from '../context/AuthContext';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { rankService } from '../services/api/ranks';
import { tripService } from '../services/api/trips';
import { applicationService } from '../services/api/applications';
import { distanceKm } from '../services/location';
import { recentPlaces } from '../services/recentPlaces';
import { Application } from '../types/applications';
import { Rank } from '../types/admin';
import { Place } from '../types/journeys';
import { Trip } from '../types/trips';
import { Banner, Button, Chip, EmptyState, Group, ListRow, Screen, SectionLabel, Segmented } from '../components/ui';
import { STATUS_LABEL, STATUS_TONE } from './commuter/applicationStatus';
import { formatDistance } from './commuter/journeyFormat';
import { colors, radius } from '../theme';

const RADII = [
  { value: '1', label: '1 km' },
  { value: '2', label: '2 km' },
  { value: '5', label: '5 km' },
];

/** H1: where to? Plus the trip in progress, recent destinations and ranks within walking distance */
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const { user, can } = useAuth();
  const { location, problem, locating, locate } = useCurrentLocation();
  const [radiusKm, setRadiusKm] = useState('2');
  const [ranks, setRanks] = useState<Rank[] | null>(null);
  const [recent, setRecent] = useState<Place[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [latest, setLatest] = useState<Application | null>(null);

  useFocusEffect(
    useCallback(() => {
      rankService.list().then(setRanks).catch(() => setRanks([]));
      recentPlaces.list().then(setRecent);
      if (can('TRIPS_OWN')) {
        tripService.active().then(setActiveTrip).catch(() => setActiveTrip(null));
      }
      if (can('APPLICATIONS_SUBMIT')) {
        applicationService.mine().then(apps => setLatest(apps[0] ?? null)).catch(() => setLatest(null));
      }
    }, [can]),
  );

  const near = useMemo(() => {
    if (!location || !ranks) return [];
    return ranks
      .filter(r => r.isActive && r.latitude != null && r.longitude != null)
      .map(r => ({ rank: r, km: distanceKm(location, { latitude: r.latitude!, longitude: r.longitude! }) }))
      .filter(r => r.km <= Number(radiusKm))
      .sort((a, b) => a.km - b.km);
  }, [location, ranks, radiusKm]);

  const nearest = near[0]?.rank.name;
  const go = (place: Place) => navigation.navigate('JourneyResults', { place, radiusKm: Number(radiusKm) });

  return (
    <Screen subtitle="Travy" title={`Hi, ${user?.firstName ?? 'there'}`} tabbed>
      {activeTrip ? (
        <TouchableOpacity
          testID="active-trip"
          style={styles.activeTrip}
          onPress={() => navigation.navigate('ActiveTrip')}
          accessibilityRole="button"
          accessibilityHint="Opens your trip in progress"
        >
          <Text style={styles.activeLabel}>IN A TAXI</Text>
          <Text style={styles.activeText}>{activeTrip.rank.name} → {activeTrip.destination}</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        testID="where-to"
        style={styles.whereTo}
        onPress={() => navigation.navigate('DestinationSearch', { radiusKm: Number(radiusKm) })}
        accessibilityRole="search"
        accessibilityLabel="Where to?"
      >
        <Text style={styles.search} importantForAccessibility="no">⌕</Text>
        <Text style={styles.whereToText}>Where to?</Text>
      </TouchableOpacity>

      {problem ? (
        <Banner tone="info" title={problem === 'denied' ? 'Location is off' : "Couldn't find you"}>
          <View style={styles.bannerBody}>
            <Text style={styles.bannerText}>
              {problem === 'denied'
                ? 'Allow location to see ranks you can walk to. You can still search for a destination.'
                : 'Check that location is on, then try again.'}
            </Text>
            <Button title="Try again" variant="secondary" onPress={locate} />
          </View>
        </Banner>
      ) : (
        <Text style={styles.where}>
          {locating ? 'Finding you…' : nearest ? `Near ${nearest}` : 'No ranks within walking distance'}
        </Text>
      )}
      <View style={styles.radiusRow}>
        <Text style={styles.radiusLabel}>Ranks within</Text>
        <Segmented options={RADII} value={radiusKm} onChange={setRadiusKm} />
      </View>

      {recent.length ? (
        <>
          <SectionLabel>Recent destinations</SectionLabel>
          <Group>
            {recent.map((p, i) => (
              <ListRow key={p.name} title={p.name} subtitle={p.area} onPress={() => go(p)} last={i === recent.length - 1} />
            ))}
          </Group>
        </>
      ) : null}

      <View style={styles.sectionRow}>
        <SectionLabel>Ranks near you</SectionLabel>
        {location ? <Text style={styles.count}>{near.length === 1 ? '1 rank' : `${near.length} ranks`}</Text> : null}
      </View>
      {!location ? (
        <EmptyState>{locating ? 'Finding ranks near you…' : 'Turn on location to see ranks near you.'}</EmptyState>
      ) : near.length === 0 ? (
        <EmptyState>{`No ranks within ${radiusKm} km. Try 5 km.`}</EmptyState>
      ) : (
        <Group>
          {near.map((r, i) => (
            <ListRow
              key={r.rank.id}
              title={r.rank.name}
              subtitle={`${formatDistance(r.km)} · ${r.rank.address}`}
              onPress={() =>
                go({ name: r.rank.name, area: r.rank.address, latitude: r.rank.latitude!, longitude: r.rank.longitude!, kind: 'RANK' })
              }
              last={i === near.length - 1}
            />
          ))}
        </Group>
      )}

      {can('APPLICATIONS_SUBMIT') ? (
        latest ? (
          <TouchableOpacity style={styles.application} onPress={() => navigation.navigate('MyApplication')} accessibilityRole="button">
            <Text style={styles.applicationText}>Your application for {latest.rank?.name ?? latest.proposedRank?.name}</Text>
            <Chip label={STATUS_LABEL[latest.status]} tone={STATUS_TONE[latest.status]} />
          </TouchableOpacity>
        ) : (
          <Button testID="apply-entry" title="Run a taxi rank? Apply to manage it" variant="link" onPress={() => navigation.navigate('Apply')} />
        )
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  activeTrip: { backgroundColor: colors.gold, borderRadius: radius.lg, padding: 16, gap: 4 },
  activeLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: colors.ink },
  activeText: { fontSize: 16, fontWeight: '700', color: colors.ink },
  whereTo: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 18, backgroundColor: colors.ink, borderRadius: radius.lg },
  search: { fontSize: 24, color: colors.gold },
  whereToText: { fontSize: 18, fontWeight: '700', color: '#f5f5f0' },
  where: { fontSize: 14, color: '#3f3f3f', paddingHorizontal: 4 },
  bannerBody: { gap: 10 },
  bannerText: { fontSize: 14, lineHeight: 20, color: colors.text },
  radiusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  radiusLabel: { fontSize: 13, color: colors.textSubtle },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  count: { fontSize: 13, color: colors.textSubtle },
  application: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 },
  applicationText: { flex: 1, fontSize: 14, color: colors.textMuted },
});

export default HomeScreen;
