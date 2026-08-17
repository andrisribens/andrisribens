import { useCallback, useEffect, useState } from 'react';
import type { Place } from '@/app/utilities/actions';
import {
  addRecentPlace,
  readRecentPlaces,
  rememberRecentPlace,
  removeRecentPlace,
  writeRecentPlaces,
  type RecentPlace,
} from '@/app/utilities/placeSearch';

export function useRecentPlaces() {
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setRecentPlaces(readRecentPlaces());
    setIsLoaded(true);
  }, []);

  const rememberPlace = useCallback((place: Place) => {
    setRecentPlaces(rememberRecentPlace(place));
  }, []);

  const bumpPlace = useCallback((place: RecentPlace) => {
    const next = addRecentPlace(readRecentPlaces(), place);
    writeRecentPlaces(next);
  }, []);

  const removePlace = useCallback((place: RecentPlace) => {
    setRecentPlaces(removeRecentPlace(place));
  }, []);

  return { recentPlaces, rememberPlace, bumpPlace, removePlace, isLoaded };
}
