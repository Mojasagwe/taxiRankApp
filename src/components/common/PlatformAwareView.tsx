import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { isPlatform, getContainerPadding } from '../../utils/platformUtils';

interface PlatformAwareViewProps extends ViewProps {
  padded?: boolean;
  containerStyle?: boolean;
  androidAdjustment?: number;
  iosAdjustment?: number;
}

/**
 * A View component that automatically handles platform-specific styling differences
 * to maintain consistent layout between Android and iOS
 */
const PlatformAwareView: React.FC<PlatformAwareViewProps> = ({
  style,
  padded = false,
  containerStyle = false,
  androidAdjustment = 0,
  iosAdjustment = 0,
  ...rest
}) => {
  const platformAdjustment = isPlatform('ios') 
    ? iosAdjustment 
    : androidAdjustment;

  const combinedStyle = [
    padded && styles.padded,
    containerStyle && styles.container,
    platformAdjustment !== 0 && { padding: platformAdjustment },
    style,
  ];

  return <View style={combinedStyle} {...rest} />;
};

const styles = StyleSheet.create({
  padded: {
    ...getContainerPadding(),
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});

export default PlatformAwareView; 