import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TextInputProps
} from 'react-native';
import { styles } from './FormInput.styles';

interface FormInputProps extends TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  multiline?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  helperText,
  style,
  multiline = false,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
          style
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

export default FormInput; 