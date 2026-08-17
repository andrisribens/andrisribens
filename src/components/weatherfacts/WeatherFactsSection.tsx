'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getDaylightData,
  getWeather,
  reverseGeocode,
  searchPlaces,
  type DaylightData,
  type Place,
} from '@/app/utilities/actions';
import {
  getPlaceDateString,
  getPlaceTimezone,
  getPlaceTimezoneOffset,
} from '@/app/utilities/chartLabels';
import { buildMinimalPlace, toLatitude, toLongitude } from '@/app/utilities/placeSearch';
import type { WeatherData } from '@/app/utilities/weatherTypes';
import Loader from '@/app/weather/loading';
import WeatherFactsClient from './WeatherFactsClient';

type DisplayState = {
  weather: WeatherData;
  onePlace: Place;
  daylight: DaylightData | null;
};

type WeatherFactsSectionProps = {
  placeData: string;
  lat?: number | null;
  lon?: number | null;
};

const WeatherFactsSection = ({
  placeData,
  lat,
  lon,
}: WeatherFactsSectionProps) => {
  const [displayData, setDisplayData] = useState<DisplayState | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(placeData.trim()));
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const query = placeData.trim();
    if (!query) return;

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const latFromUrl = lat != null ? toLatitude(lat) : null;
        const lonFromUrl = lon != null ? toLongitude(lon) : null;
        const hasCoords = latFromUrl !== null && lonFromUrl !== null;

        let onePlace: Place;

        if (hasCoords) {
          onePlace = buildMinimalPlace(query, latFromUrl, lonFromUrl);

          try {
            const enriched = await reverseGeocode(latFromUrl, lonFromUrl);
            if (requestId !== requestIdRef.current) return;
            if (enriched) {
              const selectedName = query.trim();
              onePlace = {
                ...enriched,
                name: selectedName || enriched.name,
              };
            }
          } catch (reverseError) {
            console.error('Error enriching place metadata:', reverseError);
          }
        } else {
          const places = await searchPlaces(query, 1);
          if (requestId !== requestIdRef.current) return;

          if (!Array.isArray(places) || places.length === 0) {
            setError('No place found');
            setIsLoading(false);
            return;
          }

          onePlace = places[0];
        }

        const latNum = toLatitude(onePlace.lat);
        const lonNum = toLongitude(onePlace.lon);

        if (latNum === null || lonNum === null) {
          setError('Found a place, but its coordinates look invalid.');
          setIsLoading(false);
          return;
        }

        const weather = (await getWeather(latNum, lonNum)) as WeatherData;
        if (requestId !== requestIdRef.current) return;

        let daylight: DaylightData | null = null;
        try {
          const placeTimezone =
            getPlaceTimezone(latNum, lonNum) ??
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          const now = new Date();

          daylight = await getDaylightData(
            latNum,
            lonNum,
            getPlaceDateString(placeTimezone, now),
            getPlaceTimezoneOffset(placeTimezone, now),
          );
        } catch (daylightError) {
          console.error('Error fetching daylight data:', daylightError);
        }

        if (requestId !== requestIdRef.current) return;

        setDisplayData({ weather, onePlace, daylight });
        setIsLoading(false);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error('Error fetching weather data:', err);
        setError("Couldn't load weather data right now. Please try again.");
        setIsLoading(false);
      }
    })();
  }, [placeData, lat, lon]);

  if (!displayData && error) {
    return <div className="container">{error}</div>;
  }

  // Place is set but data isn't ready yet — show loader (covers first paint
  // before the fetch effect runs, when isLoading may still be true from init).
  if (!displayData && placeData.trim()) {
    return (
      <div className="container">
        <Loader />
      </div>
    );
  }

  if (!displayData) return null;

  return (
    <WeatherFactsClient
      weather={displayData.weather}
      onePlace={displayData.onePlace}
      daylight={displayData.daylight}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default WeatherFactsSection;
