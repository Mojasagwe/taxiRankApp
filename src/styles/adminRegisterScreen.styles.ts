import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60, // Increased padding to ensure it's below dynamic island
    paddingBottom: 20,
    backgroundColor: '#fff',
    width: '100%',
    paddingHorizontal: 20,
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
    zIndex: 1000, // Important for dropdown
  },
  dropdownContainer: {
    marginTop: 5,
    zIndex: 1000, // Important for dropdown visibility
  },
  dropdown: {
    backgroundColor: '#f5f5f5',
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 10,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderColor: '#e3ac34',
    borderWidth: 1.2,
    borderRadius: 10,
  },
  noRanksText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noRanksContainer: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
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