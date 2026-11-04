import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { colors } from '../../theme';

type Tab = 'Applications' | 'Users';

/** Bottom bar switching between the System Administrator's top-level screens */
const AdminTabs: React.FC<{ current: Tab }> = ({ current }) => {
  const navigation = useNavigation<NativeStackNavigationProp<SystemAdminStackParamList>>();
  return (
    <View accessibilityRole="tablist" style={styles.bar}>
      {(['Applications', 'Users'] as Tab[]).map(tab => {
        const selected = tab === current;
        return (
          <TouchableOpacity
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => !selected && navigation.replace(tab)}
            style={styles.tab}
          >
            <View style={[styles.marker, selected && styles.markerOn]} />
            <Text style={[styles.label, selected && styles.labelOn]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface, paddingBottom: 16 },
  tab: { flex: 1, alignItems: 'center', paddingTop: 8, minHeight: 52, gap: 4 },
  marker: { width: 28, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  markerOn: { backgroundColor: colors.gold },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSubtle },
  labelOn: { color: colors.ink, fontWeight: '800' },
});

export default AdminTabs;
