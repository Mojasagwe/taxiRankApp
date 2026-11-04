import { useCallback, useEffect, useState } from 'react';
import { currentPosition, LocationError, LocationProblem } from '../services/location';
import { Coordinates } from '../types/journeys';

/** The rider's position, with loading and a reason when there's none */
export const useCurrentLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [problem, setProblem] = useState<LocationProblem | null>(null);
  const [locating, setLocating] = useState(true);

  const locate = useCallback(async () => {
    setLocating(true);
    setProblem(null);
    try {
      setLocation(await currentPosition());
    } catch (e) {
      setProblem(e instanceof LocationError ? e.problem : 'unavailable');
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return { location, problem, locating, locate };
};
