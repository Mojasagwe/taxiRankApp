import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HourlyWait } from '../../types/journeys';
import { colors } from '../../theme';

const pad = (h: number) => `${String(h).padStart(2, '0')}:00`;
const MAX_BAR = 72;

/**
 * Typical minutes until a taxi leaves, by hour, from riders' trips. One series: grey bars, the
 * current hour in ink with a "Now" label (never colour alone). Tap a bar to read its hour.
 * Hours without enough reports are left out.
 */
export const WaitChart: React.FC<{ hours: HourlyWait[]; nowHour: number; destination: string }> = ({
  hours,
  nowHour,
  destination,
}) => {
  const shown = hours.filter(h => h.typicalWaitMinutes != null);
  const [selected, setSelected] = useState(shown.some(h => h.hour === nowHour) ? nowHour : shown[0]?.hour);
  if (!shown.length) {
    return null;
  }
  const max = Math.max(...shown.map(h => h.typicalWaitMinutes!), 10);
  const pick = shown.find(h => h.hour === selected) ?? shown[0];
  const first = shown[0].hour;
  const last = shown[shown.length - 1].hour;
  const ticks = [first, Math.round(first + (last - first) / 3), Math.round(first + ((last - first) * 2) / 3), last];

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>
        <Text style={styles.captionStrong}>{pick.hour === nowHour ? 'Right now, ' : `Around ${pad(pick.hour)}, `}</Text>
        taxis to {destination} usually leave in about {pick.typicalWaitMinutes} min.
      </Text>
      <View style={styles.plot} accessibilityRole="list" accessibilityLabel="Typical minutes until a taxi leaves, by hour">
        {shown.map(h => {
          const isNow = h.hour === nowHour;
          const on = h.hour === pick.hour;
          return (
            <TouchableOpacity
              key={h.hour}
              style={styles.column}
              onPress={() => setSelected(h.hour)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${pad(h.hour)}, about ${h.typicalWaitMinutes} minutes${isNow ? ', now' : ''}`}
            >
              {/* Wider than its column on purpose: centred over the bar, never wrapped */}
              <Text style={[styles.now, !isNow && styles.hidden]} numberOfLines={1}>
                Now
              </Text>
              <View
                style={[
                  styles.bar,
                  { height: Math.max(4, Math.round((h.typicalWaitMinutes! / max) * MAX_BAR)) },
                  isNow && styles.barNow,
                  on && styles.barSelected,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.axis} importantForAccessibility="no-hide-descendants">
        {ticks.map((t, i) => (
          <Text key={`${t}-${i}`} style={styles.tick}>{pad(t)}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  caption: { fontSize: 15, lineHeight: 22, color: colors.text },
  captionStrong: { fontWeight: '700' },
  plot: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 100, borderBottomWidth: 1, borderBottomColor: '#d6d4ce' },
  column: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  now: { width: 40, textAlign: 'center', fontSize: 11, fontWeight: '800', color: colors.ink, marginBottom: 3 },
  hidden: { opacity: 0 },
  bar: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: '#8a877f' },
  barNow: { backgroundColor: colors.ink },
  barSelected: { borderWidth: 2, borderColor: colors.gold },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  tick: { fontSize: 11, color: colors.textSubtle },
});
