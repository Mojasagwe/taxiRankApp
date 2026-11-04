import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Asset, ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { useAuth } from '../../context/AuthContext';
import { myAccountService } from '../../services/api/account';
import { tripService } from '../../services/api/trips';
import { apiError } from '../../services/api/axios';
import { TripSummary } from '../../types/trips';
import { Banner, Button, Group, ListRow, Screen, SectionLabel } from '../../components/ui';
import { Avatar, PhotoChoice, PhotoSheet, StatRow } from '../../components/rider';
import { formatFare } from './tripFormat';
import { colors } from '../../theme';

// Phones take 12 MP photos; shrink before upload so they stay well under the 5 MB limit
const PICKER_OPTIONS = { mediaType: 'photo', maxWidth: 1024, maxHeight: 1024, quality: 0.8 } as const;

const PICKER_ERRORS: Record<string, string> = {
  camera_unavailable: 'This phone has no camera available.',
  permission: 'Travy needs permission to use the camera. Allow it in your phone settings.',
};

/** R1: the rider's profile — photo, details, stats and the way into account screens */
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const { user, logout, updateUser, can } = useAuth();
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!can('TRIPS_OWN')) return;
    try {
      setSummary(await tripService.summary());
    } catch {
      setSummary(null); // stats show dashes; the rest of the screen still works
    }
  }, [can]);

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [loadSummary]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);
  };

  const upload = async (asset: Asset) => {
    setUploading(true);
    setError(null);
    try {
      await updateUser(await myAccountService.uploadPhoto({ uri: asset.uri!, type: asset.type, fileName: asset.fileName }));
    } catch (e) {
      setError(apiError(e, 'Could not save the photo'));
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () =>
    Alert.alert('Remove photo?', 'Your initials will show instead.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setUploading(true);
          setError(null);
          try {
            await updateUser(await myAccountService.removePhoto());
          } catch (e) {
            setError(apiError(e, 'Could not remove the photo'));
          } finally {
            setUploading(false);
          }
        },
      },
    ]);

  const onPicked = (result: ImagePickerResponse) => {
    if (result.didCancel) return;
    if (result.errorCode) {
      setError(PICKER_ERRORS[result.errorCode] ?? 'Could not open the photo');
      return;
    }
    const asset = result.assets?.[0];
    if (asset?.uri) upload(asset);
  };

  const choose = (choice: PhotoChoice) => {
    setSheetOpen(false);
    if (choice === 'camera') launchCamera({ ...PICKER_OPTIONS, saveToPhotos: false }, onPicked);
    else if (choice === 'library') launchImageLibrary({ ...PICKER_OPTIONS, selectionLimit: 1 }, onPicked);
    else removePhoto();
  };

  if (!user) return null;
  const stat = (value?: string) => (summary ? value! : '—');

  return (
    <Screen title="Profile" tabbed refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.identity}>
        <TouchableOpacity
          testID="change-photo"
          accessibilityRole="button"
          accessibilityLabel={user.photoUrl ? 'Change profile photo' : 'Add a profile photo'}
          onPress={() => setSheetOpen(true)}
          disabled={uploading}
        >
          <Avatar name={user.displayName} photoUrl={user.photoUrl} size={96} />
          <View style={styles.photoBadge}>
            {uploading ? <ActivityIndicator size="small" color={colors.gold} /> : <Text style={styles.photoBadgeText}>Edit</Text>}
          </View>
        </TouchableOpacity>
        <Text style={styles.name} accessibilityRole="header">{user.displayName}</Text>
        <Text style={styles.contact}>{[user.email, user.phoneNumber].filter(Boolean).join('  ·  ')}</Text>
      </View>

      {error ? <Banner tone="danger">{error}</Banner> : null}

      {can('TRIPS_OWN') ? (
        <StatRow
          stats={[
            { label: 'Trips taken', value: stat(String(summary?.tripsTaken)) },
            { label: 'Spent this month', value: stat(summary ? formatFare(summary.spentThisMonth) : undefined) },
            { label: 'Ranks used', value: stat(String(summary?.ranksUsed)) },
          ]}
        />
      ) : null}

      <SectionLabel>Account</SectionLabel>
      <Group>
        <ListRow testID="row-edit-details" title="Edit details" subtitle="Name, email and mobile number" onPress={() => navigation.navigate('EditDetails')} />
        <ListRow testID="row-password" title="Change password" onPress={() => navigation.navigate('MyPassword')} />
        <ListRow testID="row-trips" title="My trips" subtitle="Trips you've taken or planned" onPress={() => navigation.navigate('Tabs', { screen: 'Trips' })} />
        <ListRow testID="row-settings" title="Account settings" subtitle="Notifications, privacy, delete account" onPress={() => navigation.navigate('Settings')} last />
      </Group>

      <Button testID="logout-button" title="Log out" variant="secondary" onPress={logout} style={styles.logout} />

      <PhotoSheet visible={sheetOpen} hasPhoto={!!user.photoUrl} onChoose={choose} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  photoBadge: {
    position: 'absolute',
    right: -6,
    bottom: -2,
    minWidth: 44,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadgeText: { color: colors.gold, fontSize: 12, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 6, textAlign: 'center' },
  contact: { fontSize: 14, color: colors.textSubtle, textAlign: 'center' },
  logout: { marginTop: 8 },
});

export default ProfileScreen;
