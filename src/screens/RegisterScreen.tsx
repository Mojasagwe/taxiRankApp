import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RegisterRequest } from '../types/auth';
import { styles } from '../styles/registerScreen.styles';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import FormInput from '../components/inputs/FormInput';
import PrimaryButton from '../components/buttons/PrimaryButton';
import LinkButton from '../components/buttons/LinkButton';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    preferredPaymentMethod: 'CASH',
  });

  const handleRegister = async () => {
    try {
      // Validate all fields
      const { firstName, lastName, email, phoneNumber, password } = formData;
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Password validation
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        preferredPaymentMethod: 'CASH' as const,
      };

      const response = await register(userData);
      
      if (response.success) {
        Alert.alert('Success', 'Registration successful! Please login.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.error || 'Registration failed');
      }
    } catch (error: any) {
      // Don't show error popup for AsyncStorage errors
      if (!error.message?.includes('AsyncStorage') && !error.message?.includes('non-critical')) {
        Alert.alert('Error', error.message || 'Registration failed');
      }
    }
  };

  const updateFormData = (key: keyof RegisterRequest, value: string): void => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <FormInput
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(value) => updateFormData('firstName', value)}
            autoCapitalize="words"
          />

          <FormInput
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(value) => updateFormData('lastName', value)}
            autoCapitalize="words"
          />

          <FormInput
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormInput
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(value) => updateFormData('phoneNumber', value)}
            keyboardType="phone-pad"
          />

          <FormInput
            placeholder="Password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
            autoCapitalize="none"
          />

          <PrimaryButton
            title="Sign Up"
            onPress={handleRegister}
          />

          <LinkButton
            title="Already have an account? Sign in"
            onPress={() => navigation.navigate('Login')}
          />
          
          <LinkButton
            title="Back to start screen"
            onPress={() => navigation.navigate('Landing')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen; 