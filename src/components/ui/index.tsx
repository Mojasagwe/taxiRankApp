import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../../theme';

/** Page frame: title bar with optional back and right-hand action, scrollable body, optional footer */
export const Screen: React.FC<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, onBack, right, footer, scroll = true, children }) => {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.headerText}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        </View>
        {right}
      </View>
      {/* Android 15+ draws edge-to-edge and ignores adjustResize, so lift the content above the keyboard ourselves */}
      <KeyboardAvoidingView style={styles.body} behavior="padding">
        {scroll ? (
          // "handled": with the keyboard open, tapping another field focuses it instead of only closing the keyboard
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.body, styles.bodyContent]}>{children}</View>
        )}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

type ButtonVariant = 'primary' | 'secondary' | 'info' | 'danger' | 'link';

export const Button: React.FC<{
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}> = ({ title, onPress, variant = 'primary', loading = false, disabled = false, style, testID }) => (
  <TouchableOpacity
    testID={testID}
    accessibilityRole="button"
    accessibilityState={{ disabled: disabled || loading }}
    onPress={onPress}
    disabled={disabled || loading}
    style={[styles.button, buttonStyles[variant], (disabled || loading) && styles.disabled, style]}
  >
    {loading ? (
      <ActivityIndicator color={variant === 'primary' ? colors.gold : colors.ink} />
    ) : (
      <Text style={[styles.buttonText, buttonTextStyles[variant]]}>{title}</Text>
    )}
  </TouchableOpacity>
);

export const Field: React.FC<TextInputProps & { label: string; error?: string; hint?: string }> = ({
  label,
  error,
  hint,
  style,
  ...input
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      accessibilityLabel={label}
      placeholderTextColor={colors.textSubtle}
      style={[styles.input, input.multiline && styles.multiline, error ? styles.inputError : null, style]}
      {...input}
    />
    {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
);

export const Card: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
  <Text style={styles.sectionLabel}>{children.toUpperCase()}</Text>
);

type Tone = 'neutral' | 'info' | 'warn' | 'danger' | 'success' | 'alert' | 'dark';
const toneColors: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.chipNeutral, fg: '#3f3f3f' },
  info: { bg: colors.infoBg, fg: colors.info },
  warn: { bg: '#fff1cc', fg: '#6b4e00' },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  success: { bg: colors.successBg, fg: colors.success },
  alert: { bg: colors.alertBg, fg: colors.alert },
  dark: { bg: colors.ink, fg: '#f5f5f0' },
};

export const Chip: React.FC<{ label: string; tone?: Tone }> = ({ label, tone = 'neutral' }) => (
  <View style={[styles.chip, { backgroundColor: toneColors[tone].bg }]}>
    <Text style={[styles.chipText, { color: toneColors[tone].fg }]}>{label}</Text>
  </View>
);

export const Banner: React.FC<{ tone?: Tone; title?: string; children: React.ReactNode }> = ({
  tone = 'warn',
  title,
  children,
}) => (
  <View style={[styles.banner, { backgroundColor: tone === 'warn' ? colors.warnBg : toneColors[tone].bg }]}>
    {title ? <Text style={[styles.bannerTitle, { color: tone === 'warn' ? colors.warn : toneColors[tone].fg }]}>{title}</Text> : null}
    {typeof children === 'string' ? <Text style={styles.bannerText}>{children}</Text> : children}
  </View>
);

/** Row of mutually exclusive options (filters, toggles) */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map(o => {
        const selected = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, selected && styles.segmentOn]}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextOn]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const Loading: React.FC = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={colors.gold} />
  </View>
);

export const EmptyState: React.FC<{ children: string }> = ({ children }) => (
  <Text style={styles.empty}>{children}</Text>
);

const buttonStyles = StyleSheet.create({
  primary: { backgroundColor: colors.ink },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ink },
  info: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.info },
  danger: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.danger },
  link: { backgroundColor: 'transparent' },
});

const buttonTextStyles = StyleSheet.create({
  primary: { color: colors.gold },
  secondary: { color: colors.ink },
  info: { color: colors.info },
  danger: { color: colors.danger },
  link: { color: colors.goldText },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 34, lineHeight: 36, color: colors.ink },
  headerText: { flex: 1, paddingHorizontal: 8 },
  subtitle: { fontSize: 13, fontWeight: '600', color: colors.textSubtle },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  body: { flex: 1 },
  bodyContent: { padding: 20, gap: 14 },
  footer: { padding: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: colors.line, gap: 10, backgroundColor: colors.background },
  button: { minHeight: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { fontSize: 13, color: colors.danger },
  hint: { fontSize: 13, color: colors.textSubtle },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textSubtle, letterSpacing: 0.6 },
  chip: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  chipText: { fontSize: 12, fontWeight: '700' },
  banner: { borderRadius: 12, padding: 14, gap: 6 },
  bannerTitle: { fontSize: 14, fontWeight: '700' },
  bannerText: { fontSize: 14, lineHeight: 21, color: colors.text },
  segmented: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d6d4ce',
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  segmentOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  segmentText: { fontSize: 14, fontWeight: '600', color: '#3f3f3f' },
  segmentTextOn: { color: colors.gold, fontWeight: '700' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  empty: { textAlign: 'center', color: colors.textSubtle, fontSize: 15, paddingVertical: 32 },
});
