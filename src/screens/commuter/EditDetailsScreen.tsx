import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { myAccountService, UpdateMyDetails } from '../../services/api/account';
import { apiError } from '../../services/api/axios';
import { Banner, Button, Field, Screen } from '../../components/ui';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ]{9,20}$/; // same rule as the backend

/** R2: name, email and mobile. Changing how you're reached needs your password. */
const EditDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const emailChanged = email.trim().toLowerCase() !== (user?.email ?? '').toLowerCase();
  const phoneChanged = phone.trim() !== (user?.phoneNumber ?? '');
  const contactChanged = emailChanged || phoneChanged;

  const save = async () => {
    const found: Record<string, string> = {};
    if (!firstName.trim()) found.firstName = 'Enter your first name';
    if (!lastName.trim()) found.lastName = 'Enter your last name';
    if (!EMAIL.test(email.trim())) found.email = 'Enter a valid email address';
    if (!PHONE.test(phone.trim())) found.phone = 'Enter a valid mobile number';
    if (contactChanged && !password) found.password = 'Enter your current password';
    setErrors(found);
    if (Object.keys(found).length) return;

    const changes: UpdateMyDetails = {};
    if (firstName.trim() !== user?.firstName) changes.firstName = firstName.trim();
    if (lastName.trim() !== (user?.lastName ?? '')) changes.lastName = lastName.trim();
    if (emailChanged) changes.email = email.trim();
    if (phoneChanged) changes.phoneNumber = phone.trim();
    if (!Object.keys(changes).length) {
      navigation.goBack();
      return;
    }
    if (contactChanged) changes.currentPassword = password;

    setError(null);
    setSaving(true);
    try {
      await updateUser(await myAccountService.updateDetails(changes));
      navigation.goBack();
    } catch (e) {
      setError(apiError(e, 'Could not save your details'));
      setSaving(false);
    }
  };

  return (
    <Screen
      title="Edit details"
      onBack={navigation.goBack}
      footer={<Button testID="save-details" title="Save changes" onPress={save} loading={saving} />}
    >
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <Field label="First name" value={firstName} onChangeText={setFirstName} error={errors.firstName} autoComplete="given-name" />
      <Field label="Last name" value={lastName} onChangeText={setLastName} error={errors.lastName} autoComplete="family-name" />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        hint="You log in with this"
      />
      <Field label="Mobile number" value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" autoComplete="tel" />
      {contactChanged ? (
        <>
          <Banner tone="info">To keep your account safe, confirm it's you before changing your email or mobile number.</Banner>
          <Field
            testID="details-password"
            label="Current password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
          />
        </>
      ) : null}
    </Screen>
  );
};

export default EditDetailsScreen;
