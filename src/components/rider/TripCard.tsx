import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Trip } from '../../types/trips';
import { Chip } from '../ui';
import { formatFare, formatTripDate } from '../../screens/commuter/tripFormat';
import { colors, radius } from '../../theme';

/** One trip: rank → destination, fare, taken/planned, with an action */
export const TripCard: React.FC<{
  trip: Trip;
  actionLabel: string;
  onAction: () => void;
  onRemove: () => void;
  busy?: boolean;
}> = ({ trip, actionLabel, onAction, onRemove, busy = false }) => {
  const taken = trip.status === 'TAKEN';
  return (
    <View style={styles.card}>
      <View
        style={styles.top}
        accessible
        accessibilityLabel={`${taken ? 'Taken' : 'Planned'} trip from ${trip.rank.name} to ${trip.destination}, ${formatFare(trip.fare)}, ${formatTripDate(trip.tripDate)}`}
      >
        <View style={styles.line} importantForAccessibility="no-hide-descendants">
          <View style={styles.dotFrom} />
          <View style={styles.stem} />
          <View style={styles.dotTo} />
        </View>
        <View style={styles.places}>
          <Text style={styles.from}>{trip.rank.name}</Text>
          <Text style={styles.to}>{trip.destination}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.fare}>{formatFare(trip.fare)}</Text>
          <Chip label={taken ? 'Taken' : 'Planned'} tone={taken ? 'success' : 'neutral'} />
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.when}>{formatTripDate(trip.tripDate)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove trip to ${trip.destination}`} onPress={onRemove} style={styles.remove} disabled={busy}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" onPress={onAction} style={[styles.action, busy && styles.busy]} disabled={busy}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: 14, paddingHorizontal: 16, gap: 10 },
  top: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  line: { alignItems: 'center', paddingTop: 5 },
  dotFrom: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink },
  stem: { width: 2, height: 22, backgroundColor: '#d6d4ce' },
  dotTo: { width: 10, height: 10, borderRadius: 3, backgroundColor: colors.gold },
  places: { flex: 1, gap: 10 },
  from: { fontSize: 15, fontWeight: '600', color: colors.text },
  to: { fontSize: 15, fontWeight: '700', color: colors.text },
  right: { alignItems: 'flex-end', gap: 6 },
  fare: { fontSize: 17, fontWeight: '800', color: colors.text },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0efeb', paddingTop: 10, gap: 8 },
  when: { fontSize: 13, color: colors.textSubtle, flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  remove: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10 },
  removeText: { fontSize: 14, fontWeight: '600', color: colors.textSubtle },
  action: { minHeight: 44, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.ink, justifyContent: 'center' },
  actionText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  busy: { opacity: 0.5 },
});
