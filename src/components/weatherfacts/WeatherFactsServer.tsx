'use server';

import { getPlaceFree, getWeather } from '@/app/utilities/actions';
import React from 'react';
import WeatherFactsClient from './WeatherFactsClient';

function toTwoDecimalsNumber(value: string): number | null {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return Number.parseFloat(n.toFixed(2));
}

const WeatherFactsServer = async ({ placeData }: { placeData: string }) => {
  const query = (placeData ?? '').trim();
  if (!query) return null;

  // 1) Place lookup (guard against network errors / rate limits)
  let places: any[] = [];
  try {
    places = await getPlaceFree(query);
    console.log('Places: ', places);
  } catch (err) {
    console.error('Error fetching place data:', err);
    return <div>Couldn't load place data right now. Please try again.</div>;
  }

  if (!Array.isArray(places) || places.length === 0) {
    return <div>No place found</div>;
  }

  const onePlace = places[0];
  const latNum = toTwoDecimalsNumber(onePlace?.lat);
  const lonNum = toTwoDecimalsNumber(onePlace?.lon);

  if (latNum === null || lonNum === null) {
    console.error('Invalid coordinates from place API:', onePlace);
    return <div>Found a place, but its coordinates look invalid.</div>;
  }

  // 2) Weather lookup (separate error handling)
  let weather: any;
  try {
    weather = await getWeather(latNum, lonNum);
    console.log('weather from api: ', weather);
  } catch (err) {
    console.error('Error fetching weather data:', err);
    return (
      <div>
        Found <b>{onePlace?.name ?? 'the place'}</b>, but couldn't load weather
        right now. Please try again.
      </div>
    );
  }

  return <WeatherFactsClient weather={weather} onePlace={onePlace} />;
};

export default WeatherFactsServer;
