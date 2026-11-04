import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { journeyService } from '../../services/api/journeys';
import { apiError } from '../../services/api/axios';
import { ConnectingOption, JourneyResults } from '../../types/journeys';
import { Banner, Button, Loading, Screen, SectionLabel, Segmented } from '../../components/ui';
import { RouteOptionCard } from '../../components/journey';
import { formatFare } from './tripFormat';
import { formatClock, formatDuration, isPast } from './journeyFormat';
import { colors, radius } from '../../theme';

const RADII = [
  { value: '1', label: '1 km' },
  { value: '2', label: '2 km' },
  { value: '5', label: '5 km' },
];

/** H3 + H5: ranks within the radius with taxis to the destination, routes with one change, and further ranks */
const JourneyResultsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const { place, radiusKm } = useRoute<RouteProp<CommuterStackParamList, 'JourneyResults'>>().params;
  const { location, problem, locate } = useCurrentLocation();
  const [radiusValue, setRadiusValue] = useState(String(radiusKm));
  const [results, setResults] = useState<JourneyResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!location) return;
    setError(null);
    setResults(null);
    try {
      setResults(await journeyService.search(location, place, Number(radiusValue)));
    } catch (e) {
      setError(apiError(e, 'Could not search for taxis'));
    }
  }, [location, place, radiusValue]);

  useEffect(() => {
    search();
  }, [search]);

  const nothingDirect = results && results.direct.length === 0;

  return (
    <Screen subtitle="Taxis to" title={place.name} onBack={navigation.goBack}>
      <View style={styles.radiusRow}>
        <Text style={styles.radiusLabel}>Within</Text>
        <Segmented options={RADII} value={radiusValue} onChange={setRadiusValue} />
      </View>

      {problem ? (
        <>
          <Banner tone="info" title="We need your location">
            {problem === 'denied'
              ? 'Allow location so Travy can find ranks you can walk to.'
              : "Couldn't get your location. Check that it's on."}
          </Banner>
          <Button title="Try again" variant="secondary" onPress={locate} />
        </>
      ) : error ? (
        <>
          <Banner tone="danger">{error}</Banner>
          <Button title="Try again" variant="secondary" onPress={search} />
        </>
      ) : !results ? (
        <Loading />
      ) : (
        <>
          {nothingDirect ? (
            <Banner title={`No direct taxi within ${results.radiusKm} km`}>
              {results.ranksInRadius === 0
                ? 'There are no ranks that close to you. Here is what still works.'
                : `None of the ${results.ranksInRadius} ranks near you runs to ${place.name}. Here is what still works.`}
            </Banner>
          ) : (
            <>
              <SectionLabel>{`Direct · ${results.direct.length} ${results.direct.length === 1 ? 'rank' : 'ranks'}`}</SectionLabel>
              {results.direct.map(o => (
                <RouteOptionCard
                  key={`${o.rank.id}-${o.route.terminalId}`}
                  option={o}
                  onPress={() => navigation.navigate('RouteDetail', { option: o, place })}
                />
              ))}
            </>
          )}

          {results.connecting.length ? (
            <>
              <SectionLabel>With one change</SectionLabel>
              {results.connecting.map(o => (
                <ConnectingCard
                  key={`${o.firstLeg.terminalId}-${o.secondLeg.terminalId}`}
                  option={o}
                  onPress={() => navigation.navigate('ConnectingRoute', { option: o, place })}
                />
              ))}
            </>
          ) : null}

          {results.further.length ? (
            <>
              <SectionLabel>Direct · a bit further</SectionLabel>
              {results.further.map(o => (
                <RouteOptionCard
                  key={`${o.rank.id}-${o.route.terminalId}`}
                  option={o}
                  onPress={() => navigation.navigate('RouteDetail', { option: o, place })}
                />
              ))}
            </>
          ) : null}

          {nothingDirect && !results.connecting.length && !results.further.length ? (
            <Text style={styles.note}>No rank on Travy runs to {place.name} yet.</Text>
          ) : null}
          {nothingDirect && radiusValue !== '5' ? (
            <Button title="Search within 5 km" variant="secondary" onPress={() => setRadiusValue('5')} />
          ) : null}
          <Text style={styles.note}>
            Leave times come from riders' trips; fares, intervals and last taxis are set by each rank.
          </Text>
        </>
      )}
    </Screen>
  );
};

const ConnectingCard: React.FC<{ option: ConnectingOption; onPress: () => void }> = ({ option, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`From ${option.rank.name}, change at ${option.changeAt.name}, total ${formatFare(option.totalFare)}`}
  >
    <View style={styles.cardTop}>
      <View style={styles.names}>
        <Text style={styles.cardTitle}>{option.rank.name} → {option.changeAt.name}</Text>
        <Text style={styles.meta}>
          Walk {option.walkMinutes} min · taxi {formatFare(option.firstLeg.fare)} · taxi {formatFare(option.secondLeg.fare)}
        </Text>
      </View>
      <Text style={styles.fare}>{formatFare(option.totalFare)}</Text>
    </View>
    <View style={styles.cardBottom}>
      <Text style={styles.meta}>{option.totalMinutes ? `About ${formatDuration(option.totalMinutes)} door to door` : ' '}</Text>
      {option.leaveBy ? (
        <Text style={styles.leaveBy}>{isPast(option.leaveBy) ? 'Too late today' : `Leave by ${formatClock(option.leaveBy)}`}</Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  radiusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  radiusLabel: { fontSize: 13, color: colors.textSubtle },
  note: { fontSize: 13, lineHeight: 19, color: colors.textSubtle, paddingHorizontal: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 12 },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  names: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textSubtle },
  fare: { fontSize: 20, fontWeight: '800', color: colors.text },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f0efeb', paddingTop: 10 },
  leaveBy: { fontSize: 13, fontWeight: '700', color: colors.alert },
});

export default JourneyResultsScreen;
