import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place } from '../types/journeys';

// Kept on this phone only: a convenience, not account data
const KEY = 'recentPlaces';
const MAX = 5;

export const recentPlaces = {
  list: async (): Promise<Place[]> => {
    try {
      const json = await AsyncStorage.getItem(KEY);
      return json ? (JSON.parse(json) as Place[]) : [];
    } catch {
      return [];
    }
  },

  add: async (place: Place): Promise<void> => {
    try {
      const others = (await recentPlaces.list()).filter(p => p.name !== place.name);
      await AsyncStorage.setItem(KEY, JSON.stringify([place, ...others].slice(0, MAX)));
    } catch {
      // Not remembering a search is fine
    }
  },
};
