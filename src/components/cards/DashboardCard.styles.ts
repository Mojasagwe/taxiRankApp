import { StyleSheet, Platform } from 'react-native';
import { platformValue } from '../../utils/platformUtils';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: platformValue({ ios: 15, android: 15 }),
    marginBottom: 15,
    width: Platform.OS === 'ios' ? '100%' : '90%',
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: 3,
    elevation: Platform.OS === 'android' ? 0 : 4,
    borderLeftWidth: 4,
    borderLeftColor: '#e3ac34',
    marginLeft: 0,
    marginRight: 'auto',
    alignSelf: Platform.OS === 'ios' ? 'flex-start' : 'auto',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
}); 