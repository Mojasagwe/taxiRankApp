import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '../../theme';

export type PhotoChoice = 'camera' | 'library' | 'remove';

/** Bottom sheet: take a photo, choose one, or remove the current one */
export const PhotoSheet: React.FC<{
  visible: boolean;
  hasPhoto: boolean;
  onChoose: (choice: PhotoChoice) => void;
  onClose: () => void;
}> = ({ visible, hasPhoto, onChoose, onClose }) => {
  const insets = useSafeAreaInsets();
  const options: { choice: PhotoChoice; label: string }[] = [
    { choice: 'camera', label: 'Take a photo' },
    { choice: 'library', label: 'Choose from gallery' },
    ...(hasPhoto ? [{ choice: 'remove' as const, label: 'Remove photo' }] : []),
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
        <Text style={styles.title} accessibilityRole="header">Profile photo</Text>
        <Text style={styles.hint}>JPG or PNG, up to 5 MB. We crop it square.</Text>
        {options.map(o => (
          <Pressable
            key={o.choice}
            accessibilityRole="button"
            onPress={() => onChoose(o.choice)}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          >
            <Text style={[styles.optionText, o.choice === 'remove' && styles.danger]}>{o.label}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.option, styles.cancel, pressed && styles.pressed]}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 8,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  hint: { fontSize: 13, color: colors.textSubtle, marginBottom: 6 },
  option: { minHeight: 52, borderRadius: radius.md, justifyContent: 'center', paddingHorizontal: 16, backgroundColor: colors.background },
  optionText: { fontSize: 16, fontWeight: '600', color: colors.text },
  danger: { color: colors.danger },
  cancel: { backgroundColor: 'transparent', alignItems: 'center' },
  cancelText: { fontSize: 16, fontWeight: '700', color: colors.goldText },
  pressed: { opacity: 0.6 },
});
