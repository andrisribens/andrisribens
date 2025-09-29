'use client';

import { getPlaceStructured } from '@/app/utilities/actions';
import { useDebounce } from '@/app/utilities//useDebounce';
import { debounce } from '../../app/utilities/timing';
import styles from './PlaceInput.module.scss';
import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/app/weather/loading';
import Image from 'next/image';

interface PlaceInfo {
  display_name: string;
  addresstype: string;
}

const PlaceInput = () => {
  const [inputValue, setInputValue] = useState('');
  const [placeValues, setPlaceValues] = useState([
    { display_name: '', addresstype: '' },
  ]);
  const [placeName, setPlaceName] = useState('');
  const [placeIsChosen, setPlaceIsChosen] = useState(false);
  const debouncedInput = useDebounce(inputValue, 300); // 300ms debounce delay
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const updateParams = (place: string) => {
    router.push(`?place=${encodeURIComponent(place)}`);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    let alive = true;
    let callId = Math.random();
    (async () => {
      if (debouncedInput.length >= 4) {
        setPlaceIsChosen(false);
        setIsLoading(true);
        const id = callId;
        const places = await getPlaceStructured(debouncedInput);
        if (!alive || id !== callId) return;
        setPlaceValues(places);
        setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [debouncedInput]);

  const submitPlace = (name: string) => {
    setPlaceName(name);
    setPlaceIsChosen(true);
    updateParams(name);
    setInputValue('');
  };

  const createPlace = (placeInfo: PlaceInfo, idx: number) => {
    const name = placeInfo.display_name;
    return (
      <button
        key={idx}
        className={styles.placeCard}
        onClick={() => {
          submitPlace(name);
        }}
      >
        <h3>{placeInfo.display_name}</h3>
        <p>{placeInfo.addresstype}</p>
      </button>
    );
  };

  return (
    <>
      <Suspense
        fallback={
          <div>
            <h1>Loading...</h1>
          </div>
        }
      >
        <div className="container">
          <div className={styles.placeInput}>
            <div className={styles.placeInput__input}>
              <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder="Search your place"
              />

              <Image
                src="/img/search.svg"
                alt="search"
                width={30}
                height={30}
                className={styles.placeInput__icon}
              />
            </div>

            {isLoading && (
              <div className={styles.loaderwrap}>
                <Loader />
              </div>
            )}

            {(!isLoading &&
              placeValues.length &&
              placeValues[0]?.display_name !== '' &&
              !placeIsChosen && (
                <div className={styles.places}>
                  {' '}
                  {placeValues.map(createPlace)}
                </div>
              )) ||
              null}
          </div>
        </div>
      </Suspense>
    </>
  );
};

export default PlaceInput;
