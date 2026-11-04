import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../services/api/axios';
import { Banner, Button, Field, Screen } from '../components/ui';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setError('Enter your email or rank code and your password');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(identifier, password);
      // AppNavigator switches to the right screens for this account
    } catch (e) {
      setError(apiError(e, 'Login failed'));
      setSubmitting(false);
    }
  };

  return (
    <Screen
      title="Log in"
      onBack={() => navigation.goBack()}
      footer={
        <>
          <Button testID="login-button" title="Log in" onPress={handleLogin} loading={submitting} />
          <Button title="Create an account" variant="link" onPress={() => navigation.navigate('CreateAccount')} />
        </>
      }
    >
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <Field
        testID="identifier-input"
        label="Email or rank code"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        autoCorrect={false}
        hint="Rank accounts log in with their rank code, e.g. CTR001"
      />
      <Field
        testID="password-input"
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onSubmitEditing={handleLogin}
      />
    </Screen>
  );
};

export default LoginScreen;
