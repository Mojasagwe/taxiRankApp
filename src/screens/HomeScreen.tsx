import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PlatformAwareView } from '../components/common';

const HomeScreen: React.FC = () => {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  // Use generic navigation type first
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToAdminRequests = () => {
    if (isAdmin() || isSuperAdmin()) {
      // Type-safe navigation based on role
      navigation.navigate('AdminPendingRequests' as never);
    }
  };

  const navigateToAdminDashboard = () => {
    if (isAdmin()) {
      navigation.navigate('AdminDashboard' as never);
    }
  };

  return (
    <PlatformAwareView style={styles.container} padded containerStyle>
      <Text style={styles.title}>Welcome, {user?.firstName}</Text>
      
      {isSuperAdmin() ? (
        <PlatformAwareView style={styles.adminSection} padded>
          <Text style={styles.subtitle}>Super Admin Dashboard</Text>
          <Text style={styles.infoText}>Role: {user?.role}</Text>
          
          <PrimaryButton 
            title="View Pending Admin Requests"
            onPress={navigateToAdminRequests}
          />
          
          {/* Additional super admin buttons could go here */}
        </PlatformAwareView>
      ) : isAdmin() ? (
        <PlatformAwareView style={styles.adminSection} padded>
          <Text style={styles.subtitle}>Admin Dashboard</Text>
          <Text style={styles.infoText}>Role: {user?.role}</Text>
          <Text style={styles.infoText}>
            Managed Ranks: {user?.managedRanks?.length ? user.managedRanks.length : 0}
          </Text>
          
          <PrimaryButton 
            title="Go to Admin Dashboard"
            onPress={navigateToAdminDashboard}
          />
          
          <PlatformAwareView style={styles.spacer} />
          
          <PrimaryButton 
            title="View Pending Admin Requests"
            onPress={navigateToAdminRequests}
          />
        </PlatformAwareView>
      ) : (
        <PlatformAwareView style={styles.commuterSection} padded>
          <Text style={styles.subtitle}>Commuter Dashboard</Text>
          {/* Commuter-specific UI elements would go here */}
        </PlatformAwareView>
      )}
      
      <PrimaryButton 
        title="Logout"
        onPress={handleLogout}
      />
    </PlatformAwareView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textShadowColor: '#e3b040',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
    textShadowColor: '#e3b040',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 0.5,
  },
  adminSection: {
    width: '100%',
    backgroundColor: '#fff8e6',
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3b040',
  },
  commuterSection: {
    width: '100%',
    backgroundColor: '#fff8e6',
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3b040',
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  spacer: {
    height: 10,
  },
});

export default HomeScreen; 