'use client';

import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { getPlaceFree, getWeather } from '@/app/utilities/actions';
import Loader from '@/app/weather/loading';
import WeatherFactsClient from './WeatherFactsClient';
import type { SearchedPlace } from '../searchedPlaces/SearchedPlaces';

type WeatherData = ComponentProps<typeof WeatherFactsClient>['weather'];

type DisplayState = {
  weather: WeatherData;
  onePlace: SearchedPlace;
};

function toTwoDecimalsNumber(value: string): number | null {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return Number.parseFloat(n.toFixed(2));
}

const WeatherFactsSection = ({ placeData }: { placeData: string }) => {
  const [displayData, setDisplayData] = useState<DisplayState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
        const places = await getPlaceFree(query);
        if (requestId !== requestIdRef.current) return;

        if (!Array.isArray(places) || places.length === 0) {
          setError('No place found');
          setIsLoading(false);
          return;
        }

        const onePlace = places[0] as SearchedPlace;
        const latNum = toTwoDecimalsNumber(onePlace?.lat);
        const lonNum = toTwoDecimalsNumber(onePlace?.lon);

        if (latNum === null || lonNum === null) {
          setError('Found a place, but its coordinates look invalid.');
          setIsLoading(false);
          return;
        }

        const weather = (await getWeather(latNum, lonNum)) as WeatherData;
        if (requestId !== requestIdRef.current) return;

        setDisplayData({ weather, onePlace });
        setIsLoading(false);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error('Error fetching weather data:', err);
        setError("Couldn't load weather data right now. Please try again.");
        setIsLoading(false);
      }
    })();
  }, [placeData]);

  if (!displayData && isLoading) {
    return (
      <div className="container">
        <Loader />
      </div>
    );
  }

  if (!displayData && error) {
    return <div className="container">{error}</div>;
  }

  if (!displayData) return null;

  return (
    <WeatherFactsClient
      weather={displayData.weather}
      onePlace={displayData.onePlace}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default WeatherFactsSection;
