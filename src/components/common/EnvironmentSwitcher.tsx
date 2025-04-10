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
    padding: 12,
    backgroundColor: 'rgba(240, 240, 240, 0.85)',
    borderRadius: 8,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    marginHorizontal: 8,
    fontSize: 12,
  },
  status: {
    textAlign: 'center',
    marginVertical: 4,
    fontSize: 12,
  },
  statusValue: {
    fontWeight: 'bold',
  },
  baseUrl: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  }
});

export default EnvironmentSwitcher; 