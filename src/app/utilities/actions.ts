'use server';

import {
  filterPopulatedPlaces,
  normalizeToPopulatedPlace,
} from './placeSearch';
import type { WeatherData } from './weatherTypes';
import type { DaylightData, SunriseFeature, MoonTimesProperties, SunTimesProperties } from './sunriseTypes';

export type {
  InstantWeatherDetails,
  PeriodWeatherDetails,
  TimeSeriesItem,
  WeatherData,
} from './weatherTypes';

export type { DaylightData } from './sunriseTypes';

export async function getWeather(
  lat: number,
  long: number,
): Promise<WeatherData> {
  const url = `${process.env.NEXT_PUBLIC_WEATHER_API_URL}?lat=${lat}&lon=${long}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
      },
    });

    const raw = await res.text();

    if (!res.ok) {
      throw new Error(`Failed to fetch weather data: ${res.status}`);
    }

    const weather = JSON.parse(raw) as WeatherData;
    return weather;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

const METNO_HEADERS = {
  'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
};

export async function getDaylightData(
  lat: number,
  lon: number,
  date: string,
  offset: string,
): Promise<DaylightData> {
  const base = 'https://api.met.no/weatherapi/sunrise/3.0';
  const params = `lat=${lat}&lon=${lon}&date=${date}&offset=${encodeURIComponent(offset)}`;

  try {
    const [sunRes, moonRes] = await Promise.all([
      fetch(`${base}/sun?${params}`, {
        cache: 'no-store',
        headers: METNO_HEADERS,
      }),
      fetch(`${base}/moon?${params}`, {
        cache: 'no-store',
        headers: METNO_HEADERS,
      }),
    ]);

    if (!sunRes.ok || !moonRes.ok) {
      throw new Error(
        `Failed to fetch daylight data: sun ${sunRes.status}, moon ${moonRes.status}`,
      );
    }

    const [sun, moon] = await Promise.all([
      sunRes.json() as Promise<SunriseFeature<SunTimesProperties>>,
      moonRes.json() as Promise<SunriseFeature<MoonTimesProperties>>,
    ]);

    return { sun, moon };
  } catch (error) {
    console.error('Error fetching daylight data:', error);
    throw error;
  }
}

// Get Place data

export interface Place {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: [string, string, string, string];
  address?: Record<string, string>;
}

const NOMINATIM_HEADERS = {
  'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
};

export async function searchPlaces(
  placeQuery: string,
  limit = 8,
): Promise<Place[]> {
  const fetchLimit = Math.max(limit * 3, 15);
  const url =
    `${process.env.NEXT_PUBLIC_PLACE_API_URL}` +
    `q=${encodeURIComponent(placeQuery)}` +
    `&format=json` +
    `&limit=${fetchLimit}` +
    `&addressdetails=1` +
    `&accept-language=en`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: NOMINATIM_HEADERS,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch place data: ${res.status}`);
    }

    const places = filterPopulatedPlaces((await res.json()) as Place[]);
    return places.slice(0, limit);
  } catch (error) {
    console.error('Error fetching place data:', error);
    throw error;
  }
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<Place | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: NOMINATIM_HEADERS,
    });

    if (!res.ok) {
      throw new Error(`Failed to reverse geocode: ${res.status}`);
    }

    const data = (await res.json()) as Place;
    if (!data?.lat || !data?.lon) return null;
    return normalizeToPopulatedPlace(data);
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
}

/** @deprecated Use searchPlaces */
export async function getPlaceFree(placeQuery: string): Promise<Place[]> {
  return searchPlaces(placeQuery, 5);
}

/** @deprecated Use searchPlaces */
export async function getPlaceStructured(placeQuery: string): Promise<Place[]> {
  return searchPlaces(placeQuery, 8);
}
