import { Linking } from 'react-native';
import { Coordinates } from '../types/journeys';

/** Opens Google Maps (or the browser) with walking directions; no API key needed */
export const openWalkingDirections = (to: Coordinates) =>
  Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${to.latitude},${to.longitude}&travelmode=walking`,
  );
