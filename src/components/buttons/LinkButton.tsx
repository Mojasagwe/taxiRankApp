import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  TouchableOpacityProps 
} from 'react-native';

interface LinkButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}

const LinkButton: React.FC<LinkButtonProps> = ({ 
  title, 
  onPress, 
  color = '#0066cc',
  disabled = false,
  style,
  ...rest 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      {...rest}
    >
      <Text 
        style={[
          styles.buttonText, 
          { color: disabled ? '#999999' : color }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginVertical: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LinkButton; 