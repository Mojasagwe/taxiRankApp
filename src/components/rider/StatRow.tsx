import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../theme';

/** Row of headline numbers, e.g. trips taken · spent this month · ranks used */
export const StatRow: React.FC<{ stats: { label: string; value: string }[] }> = ({ stats }) => (
  <View style={styles.row}>
    {stats.map(s => (
      <View key={s.label} style={styles.tile} accessible accessibilityLabel={`${s.label}: ${s.value}`}>
        <Text style={styles.value}>{s.value}</Text>
        <Text style={styles.label}>{s.label}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center', gap: 2 },
  value: { fontSize: 20, fontWeight: '800', color: colors.text },
  label: { fontSize: 12, color: colors.textSubtle, textAlign: 'center' },
});
