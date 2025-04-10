import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.47)',
    zIndex: Platform.OS === 'ios' ? 500 : undefined,
    elevation: Platform.OS === 'android' ? 5 : undefined,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 10,
  },
  header: {
    paddingTop: 60, // Increased padding to ensure it's below dynamic island
    paddingBottom: 20,
    backgroundColor: '#fff',
    width: '100%',
    paddingHorizontal: 20,
    position: 'relative',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: '#e3b040',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#e3ac34',
    borderWidth: 1.2, // 20% increase from 1px
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  ranksSection: {
    marginTop: 10,
    zIndex: Platform.OS === 'ios' ? 1000 : undefined, // Keep high z-index for iOS
    position: 'relative', // Ensure position is relative to contain the absolute dropdown
  },
  dropdownContainer: {
    marginTop: 5,
    position: 'relative', // Necessary for absolute positioning of the dropdown
    zIndex: Platform.OS === 'ios' ? 1000 : undefined, 
  },
  dropdownContainerOpen: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  dropdown: {
    backgroundColor: '#f5f5f5',
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 10,
    position: 'relative',
  },
  dropdownShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.135,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderColor: '#e3ac34', 
    borderWidth: 1.2,
    borderRadius: 10,
    marginTop: 0,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    // Shadow for dropdown when it overlays other elements
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 8 : undefined,
  },
  noRanksText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#e3ac34',
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(227, 172, 52, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  noRanksContainer: {
    backgroundColor: '#fff8e6',
    borderWidth: 1,
    borderColor: '#e3ac34',
    borderRadius: 10,
    padding: 15,
  },
  noRanksSubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  helperText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    marginBottom: 10,
  }
}); 