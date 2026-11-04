import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { journeyService } from '../../services/api/journeys';
import { apiError } from '../../services/api/axios';
import { recentPlaces } from '../../services/recentPlaces';
import { Place } from '../../types/journeys';
import { Banner, EmptyState, Field, Group, ListRow, Screen, SectionLabel } from '../../components/ui';
import { colors } from '../../theme';

// Wait for a pause in typing before searching
const DEBOUNCE_MS = 300;

/** H2: type a destination; until Google place search is on, Travy's own route ends and ranks */
const DestinationSearchScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const { radiusKm } = useRoute<RouteProp<CommuterStackParamList, 'DestinationSearch'>>().params;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[] | null>(null);
  const [recent, setRecent] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recentPlaces.list().then(setRecent);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    let current = true;
    const timer = setTimeout(async () => {
      try {
        const found = await journeyService.places(q);
        if (current) {
          setResults(found);
          setError(null);
        }
      } catch (e) {
        if (current) setError(apiError(e, 'Search failed'));
      }
    }, DEBOUNCE_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query]);

  const choose = async (place: Place) => {
    await recentPlaces.add(place);
    navigation.replace('JourneyResults', { place, radiusKm });
  };

  const list = results ?? recent;
  return (
    <Screen title="Where to?" onBack={navigation.goBack}>
      <Field
        testID="destination-input"
        label="Destination"
        value={query}
        onChangeText={setQuery}
        placeholder="A place, area or taxi rank"
        autoFocus
        autoCorrect={false}
        returnKeyType="search"
      />
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <SectionLabel>{results ? 'Places' : 'Recent'}</SectionLabel>
      {list.length === 0 ? (
        <EmptyState>
          {results ? `No place called "${query.trim()}" yet. Try an area or a rank name.` : 'Type at least 2 letters to search.'}
        </EmptyState>
      ) : (
        <Group>
          {list.map((p, i) => (
            <ListRow key={`${p.kind}-${p.name}`} title={p.name} subtitle={p.area} onPress={() => choose(p)} last={i === list.length - 1} />
          ))}
        </Group>
      )}
      <Text style={styles.note}>Search covers places Travy's ranks serve. Full map search is coming.</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  note: { fontSize: 13, lineHeight: 19, color: colors.textSubtle, paddingHorizontal: 4 },
});

export default DestinationSearchScreen;
