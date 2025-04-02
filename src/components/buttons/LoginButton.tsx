import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  TouchableOpacityProps
} from 'react-native';

interface LoginButtonProps extends TouchableOpacityProps {
  onPress: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  onPress,
  style,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      {...rest}
    >
      <View style={styles.container}>
        <Text style={styles.text}>Login</Text>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 50,
    right: 15,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f7bb07',
    marginRight: 5,
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f7bb07',
  },
});

export default LoginButton; 