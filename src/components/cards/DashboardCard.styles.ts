import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 15,
    minWidth: '46%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#e3ac34',
    flex: 1,
    marginHorizontal: 5,
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
  }
}); 