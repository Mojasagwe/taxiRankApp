import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { apiEnvironment } from '../../services/api/axios';

const EnvironmentSwitcher = () => {
  const [isTestEnv, setIsTestEnv] = useState(false);
  const [currentEnv, setCurrentEnv] = useState('LOCAL');

  useEffect(() => {
    const checkEnvironment = async () => {
      const env = await apiEnvironment.getCurrentEnvironment();
      setIsTestEnv(env === 'TEST');
      setCurrentEnv(env);
    };
    
    checkEnvironment();
  }, []);

  const toggleEnvironment = async (value: boolean) => {
    if (value) {
      await apiEnvironment.useTestEnvironment();
      setCurrentEnv('TEST');
    } else {
      await apiEnvironment.useLocalEnvironment();
      setCurrentEnv('LOCAL');
    }
    setIsTestEnv(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Environment</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Local</Text>
        <Switch
          value={isTestEnv}
          onValueChange={toggleEnvironment}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isTestEnv ? '#f5dd4b' : '#f4f3f4'}
        />
        <Text style={styles.label}>Test (Heroku)</Text>
      </View>
      <Text style={styles.status}>
        Current: <Text style={styles.statusValue}>{currentEnv}</Text>
      </Text>
      <Text style={styles.baseUrl}>
        {isTestEnv 
          ? 'https://taxi-rank-backend-30afe3719f7a.herokuapp.com/api'
          : Platform.OS === 'ios' 
            ? 'http://localhost:8080/api'
            : 'http://10.0.2.2:8080/api'
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  status: {
    textAlign: 'center',
    marginVertical: 8,
  },
  statusValue: {
    fontWeight: 'bold',
  },
  baseUrl: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  }
});

export default EnvironmentSwitcher; 