import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputFocused: {
    borderColor: '#e3ac34',
    borderWidth: 1.2, // 20% increase from 1px
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: 15,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  helperText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  }
}); 