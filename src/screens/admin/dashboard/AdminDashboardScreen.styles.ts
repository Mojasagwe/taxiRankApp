import { StyleSheet, Platform, Dimensions } from 'react-native';
import { getContainerPadding } from '../../../utils/platformUtils';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    ...(Platform.OS === 'ios' ? { paddingLeft: 0, paddingRight: 0 } : {}),
  },
  content: {
    flex: 1,
    ...(Platform.OS === 'ios' ? {} : getContainerPadding()),
    paddingLeft: Platform.OS === 'ios' ? 0 : undefined,
    paddingRight: Platform.OS === 'ios' ? 0 : undefined,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  cardsContainer: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'flex-start',
    marginTop: Platform.OS === 'ios' ? height * 0.35 : height * 0.10,
    paddingLeft: Platform.OS === 'ios' ? 0 : 15,
    paddingRight: 0,
  },
}); 
 