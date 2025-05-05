'use server';

import { getPlaceFree, getWeather } from '@/app/utilities/actions';
import React from 'react';
import WeatherFactsClient from './WeatherFactsClient';

const WeatherFactsServer = async ({ placeData }: { placeData: string }) => {
  if (!placeData) return null;

  const places = await getPlaceFree(placeData);
  if (!places.length) return <div>No place found</div>;

  const onePlace = places[0];
  const { lat, lon, name } = onePlace;
  // Transform coordinates to number and then to number with two decimals
  const latNum = parseFloat(parseFloat(lat).toFixed(2));
  const longNum = parseFloat(parseFloat(lon).toFixed(2));

  const weather = await getWeather(latNum, longNum);

  return <WeatherFactsClient weather={weather} onePlace={onePlace} />;
};

export default WeatherFactsServer;
