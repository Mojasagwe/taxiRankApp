import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

export interface PasswordRule {
  ok: boolean;
  text: string;
}

/** Rules for a new password, plus whether they're all met */
export const passwordRules = (
  current: string,
  next: string,
  confirm: string,
  { minLength = 8, differentText = 'Different from your current password' } = {},
): { rules: PasswordRule[]; valid: boolean } => {
  const rules = [
    { ok: next.length >= minLength, text: `At least ${minLength} characters` },
    { ok: next.length > 0 && next !== current, text: differentText },
    { ok: next.length > 0 && next === confirm, text: 'Passwords match' },
  ];
  return { rules, valid: current.length > 0 && rules.every(r => r.ok) };
};

/** Checklist that ticks off as the person types */
export const PasswordRules: React.FC<{ rules: PasswordRule[] }> = ({ rules }) => (
  <View style={styles.list} accessibilityRole="list">
    {rules.map(rule => (
      <Text
        key={rule.text}
        style={[styles.rule, rule.ok && styles.ok]}
        accessibilityLabel={`${rule.text}: ${rule.ok ? 'done' : 'not yet'}`}
      >
        {rule.ok ? '✓' : '•'}  {rule.text}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  list: { gap: 8 },
  rule: { fontSize: 14, color: colors.textSubtle },
  ok: { color: colors.success },
});
