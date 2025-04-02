import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  TouchableOpacityProps
} from 'react-native';

interface BackHomeButtonProps extends TouchableOpacityProps {
  onPress: () => void;
}

const BackHomeButton: React.FC<BackHomeButtonProps> = ({
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
        <Text style={styles.arrow}>←</Text>
        <Text style={styles.text}>Home</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f7bb07',
    marginRight: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f7bb07',
  },
});

export default BackHomeButton; 