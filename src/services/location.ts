import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Coordinates } from '../types/journeys';

export type LocationProblem = 'denied' | 'unavailable';

export class LocationError extends Error {
  constructor(public problem: LocationProblem) {
    super(problem === 'denied' ? 'Location permission denied' : 'Location unavailable');
  }
}

/** Asks once; Android remembers "don't ask again" and then returns denied straight away */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true; // iOS asks through Geolocation itself (iOS isn't set up yet)
  }
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
    title: 'Find ranks near you',
    message: 'Travy uses your location while the app is open to show taxi ranks you can walk to.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

/** The phone's position: a fresh fix, or one up to a minute old */
export const currentPosition = async (): Promise<Coordinates> => {
  if (!(await requestLocationPermission())) {
    throw new LocationError('denied');
  }
  return new Promise((resolve, reject) =>
    Geolocation.getCurrentPosition(
      position => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      error => reject(new LocationError(error.code === 1 ? 'denied' : 'unavailable')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    ),
  );
};

/** Straight-line distance in km (haversine) */
export const distanceKm = (a: Coordinates, b: Coordinates): number => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
