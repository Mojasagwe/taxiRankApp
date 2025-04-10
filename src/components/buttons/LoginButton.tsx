import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  TouchableOpacityProps,
  Platform,
  Dimensions
} from 'react-native';

interface LoginButtonProps extends TouchableOpacityProps {
  onPress: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  onPress,
  style,
  ...rest
}) => {
  // Remove the iOS conditional block - show on both platforms
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      {...rest}
    >
      <View style={styles.container}>
        <Text style={styles.text}>Login</Text>
      </View>
    </TouchableOpacity>
  );
};

// Calculate a 5% increase in font size
const baseFontSize = 16;
const increasedFontSize = baseFontSize * 1.05;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 15,
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: increasedFontSize, // 5% increase from base size
    fontWeight: 'bold', // Changed from '500' to 'bold'
    color: '#f7bb07',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default LoginButton; 