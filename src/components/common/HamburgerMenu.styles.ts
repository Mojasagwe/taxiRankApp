import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    backgroundColor: '#000',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1000,
  },
  line: {
    width: '80%',
    height: 3,
    backgroundColor: '#e3ac34', // Yellow/gold color
    marginVertical: 3,
    borderRadius: 10,
  }
}); 