import { getPlaceFree, getWeather } from '@/app/utilities/actions';
import { toLatitude, toLongitude } from '@/app/utilities/placeSearch';
import React from 'react';
import WeatherFactsClient from './WeatherFactsClient';

const WeatherFactsServer = async ({ placeData }: { placeData: string }) => {
  const query = (placeData ?? '').trim();
  if (!query) return null;

  let places: Awaited<ReturnType<typeof getPlaceFree>> = [];
  try {
    places = await getPlaceFree(query);
  } catch (err) {
    console.error('Error fetching place data:', err);
    return <div>Couldn&apos;t load place data right now. Please try again.</div>;
  }

  if (!Array.isArray(places) || places.length === 0) {
    return <div>No place found</div>;
  }

  const onePlace = places[0];
  const latNum = toLatitude(onePlace?.lat);
  const lonNum = toLongitude(onePlace?.lon);

  if (latNum === null || lonNum === null) {
    console.error('Invalid coordinates from place API');
    return <div>Found a place, but its coordinates look invalid.</div>;
  }

  let weather: Awaited<ReturnType<typeof getWeather>>;
  try {
    weather = await getWeather(latNum, lonNum);
  } catch (err) {
    console.error('Error fetching weather data:', err);
    return (
      <div>
        Found <b>{onePlace?.name ?? 'the place'}</b>, but couldn&apos;t load weather
        right now. Please try again.
      </div>
    );
  }

  return <WeatherFactsClient weather={weather} onePlace={onePlace} />;
};

export default WeatherFactsServer;
