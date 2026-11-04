import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DirectOption } from '../../types/journeys';
import { Chip, FactGrid } from '../ui';
import { formatFare } from '../../screens/commuter/tripFormat';
import { formatClock, formatDistance, waitText } from '../../screens/commuter/journeyFormat';
import { colors, radius } from '../../theme';

/** A rank with a direct taxi to the destination: walk, fare, wait, ride, last taxi */
export const RouteOptionCard: React.FC<{ option: DirectOption; onPress: () => void }> = ({ option, onPress }) => {
  const { rank, route } = option;
  const last = formatClock(route.lastTaxiToday);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${rank.name}, ${formatDistance(option.walkKm)}, ${option.walkMinutes} minute walk, fare ${formatFare(route.fare)}`}
    >
      <View style={styles.top}>
        <View style={styles.names}>
          <Text style={styles.rank}>{rank.name}</Text>
          <Text style={styles.meta}>
            {formatDistance(option.walkKm)} · {option.walkMinutes} min walk{route.bay ? ` · ${route.bay}` : ''}
          </Text>
        </View>
        <Text style={styles.fare}>{formatFare(route.fare)}</Text>
      </View>
      {route.runningToday ? null : <Chip label="Not running today" tone="danger" />}
      <View style={styles.facts}>
        <FactGrid
          facts={[
            { label: 'Leaves', value: waitText(route) },
            { label: 'Ride', value: route.travelTime ?? '—' },
            { label: 'Last taxi', value: last ?? '—' },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 12 },
  top: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  names: { flex: 1, gap: 3 },
  rank: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textSubtle },
  fare: { fontSize: 20, fontWeight: '800', color: colors.text },
  facts: { borderTopWidth: 1, borderTopColor: '#f0efeb', paddingTop: 12 },
});
