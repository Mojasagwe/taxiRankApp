import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../context/AuthContext';
import { apiError } from '../../services/api/axios';
import { Banner, Button, Field, Screen } from '../../components/ui';
import { SignUpIntent } from '../../types/auth';
import { colors } from '../../theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ]{9,20}$/;

const CHOICES: { intent: SignUpIntent; title: string; text: string }[] = [
  { intent: 'RIDER', title: 'Rider', text: 'Find ranks, plan trips, see fares' },
  { intent: 'RANK_ADMIN', title: 'Rank admin', text: "Manage a rank's info for riders" },
];

/**
 * Sign-up for both riders and rank admins. Both get a personal login; rank admins
 * then continue to the application (Apply screen) once signed in.
 */
const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { register } = useAuth();
  const [intent, setIntent] = useState<SignUpIntent>('RIDER');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isRankAdmin = intent === 'RANK_ADMIN';

  const set = (key: keyof typeof form) => (value: string) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const next: typeof errors = {};
    if (!form.firstName.trim()) {next.firstName = 'Required';}
    if (!form.lastName.trim()) {next.lastName = 'Required';}
    if (!EMAIL.test(form.email.trim())) {next.email = 'Enter a valid email';}
    if (!PHONE.test(form.phoneNumber.trim())) {next.phoneNumber = 'Enter a valid phone number';}
    if (form.password.length < 8) {next.password = 'At least 8 characters';}
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {return;}
    setError(null);
    setSubmitting(true);
    try {
      await register(
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          password: form.password,
        },
        intent,
      );
      // Signed in: AppNavigator moves on (rank admins land on the application)
    } catch (e) {
      setError(apiError(e, 'Could not create your account'));
      setSubmitting(false);
    }
  };

  return (
    <Screen
      title="Create account"
      onBack={() => navigation.goBack()}
      footer={
        <Button
          testID="create-account-button"
          title={isRankAdmin ? 'Continue to rank details' : 'Create rider account'}
          onPress={handleSubmit}
          loading={submitting}
        />
      }
    >
      <Text style={styles.question}>I'm signing up as a…</Text>
      <View style={styles.choices}>
        {CHOICES.map(choice => {
          const selected = choice.intent === intent;
          return (
            <TouchableOpacity
              key={choice.intent}
              testID={`choose-${choice.intent}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setIntent(choice.intent)}
              style={[styles.choice, selected && styles.choiceOn]}
            >
              <Text style={[styles.choiceTitle, selected && styles.choiceTextOn]}>{choice.title}</Text>
              <Text style={[styles.choiceText, selected && styles.choiceTextOn]}>{choice.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isRankAdmin ? (
        <Banner title="Step 1 of 2">
          Your details first, then the rank. A System Administrator reviews your application; once approved, your rank gets its own login.
        </Banner>
      ) : null}
      {error ? <Banner tone="danger">{error}</Banner> : null}

      <Field testID="first-name-input" label="First name" value={form.firstName} onChangeText={set('firstName')} error={errors.firstName} />
      <Field testID="last-name-input" label="Last name" value={form.lastName} onChangeText={set('lastName')} error={errors.lastName} />
      <Field
        testID="email-input"
        label="Email"
        value={form.email}
        onChangeText={set('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <Field
        testID="phone-input"
        label="Mobile number"
        value={form.phoneNumber}
        onChangeText={set('phoneNumber')}
        keyboardType="phone-pad"
        error={errors.phoneNumber}
      />
      <Field
        testID="password-input"
        label={isRankAdmin ? 'Password (to track your application)' : 'Password'}
        value={form.password}
        onChangeText={set('password')}
        secureTextEntry
        error={errors.password}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  question: { fontSize: 15, fontWeight: '700', color: colors.text },
  choices: { flexDirection: 'row', gap: 10 },
  choice: { flex: 1, minHeight: 120, padding: 14, borderRadius: 16, borderWidth: 2, borderColor: '#d6d4ce', backgroundColor: colors.surface, gap: 6 },
  choiceOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  choiceTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  choiceText: { fontSize: 13, lineHeight: 18, color: colors.textMuted },
  choiceTextOn: { color: colors.gold },
});

export default CreateAccountScreen;
