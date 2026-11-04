import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

/** Home · Trips · Profile, with a gold bar over the current tab (mockups R1/R4) */
export const RiderTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = descriptors[route.key].options.title ?? route.name;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
        return (
          <TouchableOpacity
            key={route.key}
            testID={`tab-${route.name}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={onPress}
            style={styles.tab}
          >
            <View style={[styles.indicator, focused && styles.indicatorOn]} />
            <Text style={[styles.label, focused && styles.labelOn]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface, paddingTop: 6, paddingHorizontal: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 6, minHeight: 48, justifyContent: 'center' },
  indicator: { width: 28, height: 4, borderRadius: 2 },
  indicatorOn: { backgroundColor: colors.gold },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSubtle },
  labelOn: { color: colors.ink, fontWeight: '800' },
});
