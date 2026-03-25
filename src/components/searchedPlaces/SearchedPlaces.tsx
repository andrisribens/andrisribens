'use client';

import React, { useEffect, useState } from 'react';
import styles from './SearchedPlaces.module.scss';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export type SearchedPlace = {
  place_id: number;
  osm_id: number;
  name: string;
  display_name: string;
};

const STORAGE_KEY = 'searched-places';

const SearchedPlaces = ({ place }: { place?: SearchedPlace }) => {
  const router = useRouter();
  const [searchedPlaces, setSearchedPlaces] = useState<SearchedPlace[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as SearchedPlace[];
        setSearchedPlaces(parsed);
      }
    } catch (error) {
      console.error('Failed to read searched places from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !place) return;

    setSearchedPlaces((prev) => {
      const alreadyExists = prev.some((p) => p.osm_id === place.osm_id);
      if (alreadyExists) return prev;

      return [place, ...prev];
    });
  }, [place, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchedPlaces));
    } catch (error) {
      console.error('Failed to save searched places to localStorage:', error);
    }
  }, [searchedPlaces, isLoaded]);

  const removePlace = (id: number) => {
    setSearchedPlaces((prev) => prev.filter((place) => place.place_id !== id));
  };

  const researchPlace = (name: string) => {
    router.push(`?place=${encodeURIComponent(name)}`);
  };

  return (
    <>
      {searchedPlaces.map(({ place_id, osm_id, name, display_name }) => (
        <div className={styles.onePlace} key={osm_id}>
          <button
            type="button"
            className={styles.onePlace__name}
            onClick={() => researchPlace(display_name)}
          >
            {name}
          </button>

          <button
            type="button"
            className={styles.onePlace__close}
            onClick={() => removePlace(place_id)}
            aria-label={`Remove ${name}`}
          >
            <Image src="/img/close.svg" alt="" width={15} height={15} />
          </button>
        </div>
      ))}
    </>
  );
};

export default SearchedPlaces;
