import { Platform, StyleSheet, Dimensions } from 'react-native';

/**
 * Returns different values based on platform
 */
export const platformValue = <T>(options: { ios: T; android: T }): T => {
  return Platform.OS === 'ios' ? options.ios : options.android;
};

/**
 * Returns platform-specific styles
 */
export const platformStyles = (options: { ios: object; android: object }): object => {
  return Platform.OS === 'ios' ? options.ios : options.android;
};

/**
 * Gets platform-specific padding values
 */
export const getPlatformPadding = (baseValue: number = 15): number => {
  return platformValue({
    ios: baseValue,
    android: baseValue + 2, // Android typically needs slightly more padding
  });
};

/**
 * Gets platform-specific container padding
 */
export const getContainerPadding = (): object => {
  return platformStyles({
    ios: {
      paddingHorizontal: 15,
      paddingVertical: 15,
    },
    android: {
      paddingHorizontal: 17, // Android needs more horizontal padding
      paddingVertical: 17,   // Android needs more vertical padding
    },
  });
};

/**
 * Gets platform-specific card styles
 */
export const getCardStyles = (): object => {
  return platformStyles({
    ios: {
      padding: 15,
      margin: 10,
      borderRadius: 10,
    },
    android: {
      padding: 17,
      margin: 12,
      borderRadius: 10,
    },
  });
};

/**
 * Gets platform-specific list item padding
 */
export const getListItemPadding = (): object => {
  return platformStyles({
    ios: {
      paddingVertical: 15,
      paddingHorizontal: 15,
    },
    android: {
      paddingVertical: 17,
      paddingHorizontal: 17,
    },
  });
};

/**
 * Creates a platform-specific StyleSheet based on the provided styles
 */
export const createPlatformStyleSheet = (styles: Record<string, any>): Record<string, any> => {
  const platformSpecificStyles: Record<string, any> = {};
  
  Object.keys(styles).forEach(key => {
    // Check if the style has a platform-specific version
    const iosKey = `${key}_ios`;
    const androidKey = `${key}_android`;
    
    if (styles[iosKey] || styles[androidKey]) {
      platformSpecificStyles[key] = {
        ...styles[key],
        ...(Platform.OS === 'ios' ? styles[iosKey] : styles[androidKey]),
      };
    } else {
      platformSpecificStyles[key] = styles[key];
    }
  });
  
  return StyleSheet.create(platformSpecificStyles);
};

/**
 * Checks if the current platform matches the provided platform
 */
export const isPlatform = (platform: 'ios' | 'android'): boolean => {
  return Platform.OS === platform;
};

/**
 * Gets screen dimensions adjusted for platform differences
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  
  return {
    width,
    height,
    // Adjusting card width for platform consistency
    cardWidth: platformValue({
      ios: width * 0.9,
      android: width * 0.85, // Android typically displays cards slightly smaller
    }),
    // Adjusted modal width for platform consistency
    modalWidth: platformValue({
      ios: width * 0.9,
      android: width * 0.85,
    }),
  };
};

export default {
  platformValue,
  platformStyles,
  getPlatformPadding,
  getContainerPadding,
  getCardStyles,
  getListItemPadding,
  createPlatformStyleSheet,
  isPlatform,
  getScreenDimensions,
}; 