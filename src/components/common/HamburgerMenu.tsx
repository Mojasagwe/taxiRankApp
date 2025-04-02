import React from 'react';
import { 
  TouchableOpacity, 
  View, 
  ViewStyle 
} from 'react-native';
import { styles } from './HamburgerMenu.styles';

interface HamburgerMenuProps {
  onPress: () => void;
  style?: ViewStyle;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.line} />
      <View style={styles.line} />
      <View style={styles.line} />
    </TouchableOpacity>
  );
};

export default HamburgerMenu; 