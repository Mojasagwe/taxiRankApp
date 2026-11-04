import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { Button } from '../components/ui';
import { EnvironmentSwitcher } from '../components/common';
import { colors } from '../theme';

const FEATURES = [
  'Search ranks and routes',
  'Plan a trip and estimate the fare',
  'Run a rank? Sign up as a rank admin',
];

const LandingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Button title="Log in" variant="link" onPress={() => navigation.navigate('Login')} />
        </View>
        <View style={styles.logo}>
          <Text style={styles.logoText}>T</Text>
        </View>
        <Text accessibilityRole="header" style={styles.title}>Welcome to Travy</Text>
        <Text style={styles.lead}>Find taxi ranks, plan trips and see fares near you.</Text>
        <View style={styles.features}>
          {FEATURES.map(feature => (
            <View key={feature} style={styles.feature}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        <Button title="Create account" onPress={() => navigation.navigate('CreateAccount')} />
        <Text style={styles.note}>
          Riders can start right away. Rank admin applications are reviewed by a System Administrator.
        </Text>
        <EnvironmentSwitcher />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end' },
  logo: { width: 64, height: 64, borderRadius: 18, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  logoText: { color: colors.gold, fontSize: 32, fontWeight: '800' },
  title: { fontSize: 34, fontWeight: '800', color: colors.text },
  lead: { fontSize: 17, lineHeight: 25, color: colors.textMuted },
  features: { gap: 10, marginVertical: 8 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  featureText: { fontSize: 15, color: colors.text, flex: 1 },
  note: { fontSize: 13, color: colors.textSubtle, textAlign: 'center' },
});

export default LandingScreen;
