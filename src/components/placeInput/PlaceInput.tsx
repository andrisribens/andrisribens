'use client';

import { getPlaceStructured } from '@/app/utilities/actions';
import styles from './PlaceInput.module.scss';
import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';

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

  const router = useRouter();

  const updateParams = (place: string) => {
    router.push(`?place=${encodeURIComponent(place)}`);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    let charNo = event.target.value.length;

    if (charNo >= 4) {
      setPlaceIsChosen(false);
      searchPlace(event.target.value);
    }
  };

  const searchPlace = async (searchPar: string) => {
    if (inputValue !== '') {
      const places = await getPlaceStructured(searchPar);
      setPlaceValues(places);
      console.log('these are placeValues: ', placeValues);
    }
  };

  const submitPlace = (name: string) => {
    setPlaceName(name);
    setPlaceIsChosen(true);
    console.log(name);

    updateParams(name);
  };

  const createPlace = (placeInfo: PlaceInfo, idx: number) => {
    const name = placeInfo.display_name;
    return (
      <div
        key={idx}
        className={styles.placeCard}
        onClick={() => {
          submitPlace(name);
          console.log(placeInfo);
        }}
      >
        <h3>{placeInfo.display_name}</h3>
        <p>{placeInfo.addresstype}</p>
      </div>
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
        <div className={styles.placeInput}>
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder="Search your place"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                searchPlace(inputValue);
              }
            }}
          />
          <button
            className={styles.placeInput__btn}
            onClick={() => searchPlace(inputValue)}
          >
            Submit
          </button>
        </div>
        {(placeValues.length &&
          placeValues[0].display_name !== '' &&
          !placeIsChosen &&
          placeValues.map(createPlace)) ||
          null}

        <h2 suppressHydrationWarning>Temperature for: {placeName}</h2>
      </Suspense>
    </>
  );
};

export default PlaceInput;
