import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { EnvironmentSwitcher } from '../components/common';

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
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.firstName}</Text>
      
      {isSuperAdmin() ? (
        <View style={styles.adminSection}>
          <Text style={styles.subtitle}>Super Admin Dashboard</Text>
          <Text style={styles.infoText}>Role: {user?.role}</Text>
          
          <PrimaryButton 
            title="View Pending Admin Requests"
            onPress={navigateToAdminRequests}
          />
          
          {/* Additional super admin buttons could go here */}
        </View>
      ) : isAdmin() ? (
        <View style={styles.adminSection}>
          <Text style={styles.subtitle}>Admin Dashboard</Text>
          <Text style={styles.infoText}>Role: {user?.role}</Text>
          <Text style={styles.infoText}>
            Managed Ranks: {user?.managedRanks?.length ? user.managedRanks.length : 0}
          </Text>
          
          <PrimaryButton 
            title="Go to Admin Dashboard"
            onPress={navigateToAdminDashboard}
          />
          
          <View style={styles.spacer} />
          
          <PrimaryButton 
            title="View Pending Admin Requests"
            onPress={navigateToAdminRequests}
          />
        </View>
      ) : (
        <View style={styles.commuterSection}>
          <Text style={styles.subtitle}>Commuter Dashboard</Text>
          {/* Commuter-specific UI elements would go here */}
        </View>
      )}
      
      <PrimaryButton 
        title="Logout"
        onPress={handleLogout}
      />
      
      {/* Environment switcher for development/testing */}
      {__DEV__ && <EnvironmentSwitcher />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3b040',
  },
  commuterSection: {
    width: '100%',
    backgroundColor: '#fff8e6',
    padding: 20,
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