import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { styles } from '../styles/loginScreen.styles';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import FormInput from '../components/inputs/FormInput';
import PrimaryButton from '../components/buttons/PrimaryButton';
import LinkButton from '../components/buttons/LinkButton';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setFormError(null);
      setIsLoading(true);
      
      // Validate all fields
      if (!email.trim() || !password.trim()) {
        setFormError('Please fill in all fields');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFormError('Please enter a valid email address');
        return;
      }

      const credentials = {
        email: email.trim(),
        password: password.trim(),
      };

      const response = await login(credentials);
      
      if (!response.success) {
        // Show alert for incorrect credentials
        Alert.alert(
          "Login Failed",
          "Incorrect username or password. Please try again.",
          [{ text: "OK" }]
        );
        setFormError(response.error || 'Login failed');
      }
    } catch (error: any) {
      // Don't show error popup for AsyncStorage errors
      if (!error.message?.includes('AsyncStorage') && !error.message?.includes('non-critical')) {
        // Show alert for login errors
        Alert.alert(
          "Login Failed",
          "Incorrect username or password. Please try again.",
          [{ text: "OK" }]
        );
        setFormError(error.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <View style={styles.form}>
        <FormInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={formError && !email.trim() ? 'Email is required' : undefined}
        />

        <FormInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={formError && !password.trim() ? 'Password is required' : undefined}
        />

        <PrimaryButton
          title="Sign In"
          onPress={handleLogin}
          isLoading={isLoading}
        />

        <LinkButton
          title="Don't have an account? Sign up"
          onPress={() => navigation.navigate('Register')}
        />
        
        <LinkButton
          title="Register as a Taxi Rank Admin"
          onPress={() => navigation.navigate('AdminRegister')}
        />
        
        <LinkButton
          title="Back to start screen"
          onPress={() => navigation.navigate('Landing')}
        />
      </View>
    </View>
  );
};

export default LoginScreen; 