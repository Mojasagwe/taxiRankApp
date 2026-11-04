import React, { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { myAccountService } from '../../services/api/account';
import { colors } from '../../theme';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]!.toUpperCase())
    .join('');

/** Profile photo, or the person's initials when there's none (or it fails to load) */
export const Avatar: React.FC<{ name: string; photoUrl?: string; size?: number }> = ({ name, photoUrl, size = 96 }) => {
  const [source, setSource] = useState<ImageSourcePropType | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    setSource(null);
    if (photoUrl) {
      myAccountService.photoSource(photoUrl).then(s => active && setSource(s));
    }
    return () => {
      active = false;
    };
  }, [photoUrl]);

  const frame = { width: size, height: size, borderRadius: size / 2 };
  if (source && !failed) {
    return (
      <Image
        testID="avatar-photo"
        accessibilityLabel={`Profile photo of ${name}`}
        source={source}
        style={[styles.photo, frame]}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View testID="avatar-initials" style={[styles.initials, frame]} accessible accessibilityLabel={`${name}, no profile photo`}>
      <Text style={[styles.initialsText, { fontSize: size * 0.36 }]}>{initials(name) || '?'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  photo: { backgroundColor: colors.chipNeutral },
  initials: { backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  initialsText: { color: colors.gold, fontWeight: '800' },
});
