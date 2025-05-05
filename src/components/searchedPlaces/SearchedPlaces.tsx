'use client';

import React from 'react';
import styles from './SearchedPlaces.module.scss';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Image from 'next/image';

const SearchedPlaces = ({ place }: { place: any }) => {
  const [searchedPlaces, setSearchedPlaces] = useState<any[]>([]);

  useEffect(() => {
    if (place) {
      setSearchedPlaces((prev) => {
        if (!prev.some((p) => p.osm_id === place.osm_id)) {
          return [...prev, place];
        }
        return prev;
      });
    }
  }, [place]);

  const removePlace = (id: number | undefined) => {
    if (id === undefined) return;
    setSearchedPlaces((prev) => prev.filter((place) => place.place_id !== id));
  };

  const router = useRouter();

  const updateParams = (place: string) => {
    router.push(`?place=${encodeURIComponent(place)}`);
  };

  interface Place {
    place_id: number;
    name: string;
  }

  const researchPlace = (name: string) => {
    updateParams(name);
  };

  return (
    <>
      {searchedPlaces.map(
        ({
          place_id,
          osm_id,
          name,
          display_name,
        }: {
          place_id: number;
          osm_id: number;
          name: string;
          display_name: string;
        }) => (
          <div className={styles.onePlace} key={osm_id}>
            <button
              className={styles.onePlace__name}
              onClick={() => researchPlace(display_name)}
            >
              {name}
            </button>
            <div className={styles.onePlace__close}>
              <Image
                src="/img/close.svg"
                alt="remove"
                width={15}
                height={15}
                onClick={() => removePlace(place_id)}
              />
            </div>
          </div>
        )
      )}
    </>
  );
};

export default SearchedPlaces;
