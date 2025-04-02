import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import RoleCard from '../components/cards/RoleCard';
import { LoginButton } from '../components/buttons';
import { styles } from '../styles/landingScreen.styles';

type LandingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

const LandingScreen: React.FC = () => {
  const navigation = useNavigation<LandingScreenNavigationProp>();

  const navigateToCommuter = () => {
    navigation.navigate('Register');
  };

  const navigateToAdmin = () => {
    navigation.navigate('AdminRegister');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoginButton onPress={() => navigation.navigate('Login')} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Travy</Text>
        <Text style={styles.subtitle}>Choose how you want to use the app</Text>
      </View>

      <View style={styles.iconsContainer}>
        <RoleCard
          title="Commuter"
          description="Find taxi ranks, plan trips, and get fare estimates"
          icon={require('../assets/icons8-man-surfing-96.png')}
          onPress={navigateToCommuter}
        />

        <RoleCard
          title="Rank Admin"
          description="Manage taxi ranks and update rank information"
          icon={require('../assets/adminOne.png')}
          onPress={navigateToAdmin}
        />
      </View>
    </SafeAreaView>
  );
};

export default LandingScreen; 