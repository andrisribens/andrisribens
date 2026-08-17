'use server';

import {
  filterPopulatedPlaces,
  LAT_MAX,
  LAT_MIN,
  LON_MAX,
  LON_MIN,
  normalizePlaceQuery,
  normalizeToPopulatedPlace,
  PLACE_SEARCH_LIMIT,
  toLatitude,
  toLongitude,
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

const FETCH_TIMEOUT_MS = 8_000;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UTC_OFFSET_RE = /^[+-](?:0\d|1[0-4]):[0-5]\d$/;

const ALLOWED_API_HOSTS = new Set([
  'api.met.no',
  'nominatim.openstreetmap.org',
]);

const WEATHER_API_FALLBACK =
  'https://api.met.no/weatherapi/locationforecast/2.0/complete';
const PLACE_SEARCH_API_FALLBACK =
  'https://nominatim.openstreetmap.org/search';
const PLACE_REVERSE_API =
  'https://nominatim.openstreetmap.org/reverse';
const SUNRISE_API_BASE = 'https://api.met.no/weatherapi/sunrise/3.0';

const METNO_HEADERS = {
  'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
};

const NOMINATIM_HEADERS = {
  'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
};

function requireHttpsApiUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Invalid API URL');
  }

  if (url.protocol !== 'https:' || !ALLOWED_API_HOSTS.has(url.hostname)) {
    throw new Error('Invalid API URL');
  }

  return url;
}

function weatherApiUrl(): URL {
  return requireHttpsApiUrl(
    process.env.NEXT_PUBLIC_WEATHER_API_URL || WEATHER_API_FALLBACK,
  );
}

function placeSearchApiUrl(): URL {
  return requireHttpsApiUrl(
    process.env.NEXT_PUBLIC_PLACE_API_URL || PLACE_SEARCH_API_FALLBACK,
  );
}

function requireCoordinates(
  lat: unknown,
  lon: unknown,
): { lat: number; lon: number } {
  const parsedLat = toLatitude(lat);
  const parsedLon = toLongitude(lon);

  if (parsedLat === null || parsedLon === null) {
    throw new Error(
      `Coordinates must be finite numbers (lat ${LAT_MIN}–${LAT_MAX}, lon ${LON_MIN}–${LON_MAX})`,
    );
  }

  return { lat: parsedLat, lon: parsedLon };
}

function requireIsoDate(value: unknown): string {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) {
    throw new Error('Invalid date');
  }
  return value;
}

function requireUtcOffset(value: unknown): string {
  if (typeof value !== 'string' || !UTC_OFFSET_RE.test(value)) {
    throw new Error('Invalid timezone offset');
  }
  return value;
}

function clampSearchLimit(limit: unknown): number {
  const n =
    typeof limit === 'number' && Number.isFinite(limit)
      ? Math.floor(limit)
      : PLACE_SEARCH_LIMIT;
  return Math.min(Math.max(n, 1), PLACE_SEARCH_LIMIT);
}

async function fetchJson(url: URL, headers: Record<string, string>) {
  const res = await fetch(url, {
    cache: 'no-store',
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export async function getWeather(
  lat: number,
  long: number,
): Promise<WeatherData> {
  const coords = requireCoordinates(lat, long);
  const url = weatherApiUrl();
  url.searchParams.set('lat', String(coords.lat));
  url.searchParams.set('lon', String(coords.lon));

  try {
    return (await fetchJson(url, METNO_HEADERS)) as WeatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

export async function getDaylightData(
  lat: number,
  lon: number,
  date: string,
  offset: string,
): Promise<DaylightData> {
  const coords = requireCoordinates(lat, lon);
  const safeDate = requireIsoDate(date);
  const safeOffset = requireUtcOffset(offset);

  const sunUrl = requireHttpsApiUrl(`${SUNRISE_API_BASE}/sun`);
  const moonUrl = requireHttpsApiUrl(`${SUNRISE_API_BASE}/moon`);

  for (const url of [sunUrl, moonUrl]) {
    url.searchParams.set('lat', String(coords.lat));
    url.searchParams.set('lon', String(coords.lon));
    url.searchParams.set('date', safeDate);
    url.searchParams.set('offset', safeOffset);
  }

  try {
    const [sun, moon] = await Promise.all([
      fetchJson(sunUrl, METNO_HEADERS) as Promise<SunriseFeature<SunTimesProperties>>,
      fetchJson(moonUrl, METNO_HEADERS) as Promise<
        SunriseFeature<MoonTimesProperties>
      >,
    ]);

    return { sun, moon };
  } catch (error) {
    console.error('Error fetching daylight data:', error);
    throw error;
  }
}

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

export async function searchPlaces(
  placeQuery: string,
  limit = 8,
): Promise<Place[]> {
  const query = normalizePlaceQuery(placeQuery);
  if (!query) {
    return [];
  }

  const safeLimit = clampSearchLimit(limit);
  const fetchLimit = Math.max(safeLimit * 3, 15);
  const url = placeSearchApiUrl();
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(fetchLimit));
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', 'en');

  try {
    const places = filterPopulatedPlaces(
      (await fetchJson(url, NOMINATIM_HEADERS)) as Place[],
    );
    return places.slice(0, safeLimit);
  } catch (error) {
    console.error('Error fetching place data:', error);
    throw error;
  }
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<Place | null> {
  const coords = requireCoordinates(lat, lon);
  const url = requireHttpsApiUrl(PLACE_REVERSE_API);
  url.searchParams.set('lat', String(coords.lat));
  url.searchParams.set('lon', String(coords.lon));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');

  try {
    const data = (await fetchJson(url, NOMINATIM_HEADERS)) as Place;
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
