import type { Place } from './actions';
import { formatPlaceType } from './sunriseTypes';

export const RECENT_PLACES_KEY = 'searched-places';
export const MIN_PLACE_QUERY_LENGTH = 2;
export const PLACE_SEARCH_LIMIT = 8;
export const RECENT_PLACES_MAX = 8;

const POPULATED_PLACE_TYPES = new Set([
  'city',
  'town',
  'village',
  'hamlet',
  'municipality',
  'locality',
  'suburb',
  'borough',
  'quarter',
  'neighbourhood',
  'neighborhood',
  'city_district',
  'township',
  'civil_parish',
  'isolated_dwelling',
]);

const ADMIN_SETTLEMENT_ADDRESSTYPES = new Set([
  ...POPULATED_PLACE_TYPES,
  'province',
  'state',
  'county',
  'region',
  'district',
]);

const EXCLUDED_PLACE_CLASSES = new Set([
  'highway',
  'building',
  'amenity',
  'shop',
  'tourism',
  'leisure',
  'office',
  'railway',
  'aeroway',
  'man_made',
  'historic',
  'craft',
  'emergency',
]);

const EXCLUDED_PLACE_TYPES = new Set([
  'island',
  'islet',
  'archipelago',
  'farm',
  'allotments',
  'house',
  'residential',
  'industrial',
  'retail',
  'commercial',
  'street',
  'road',
  'path',
  'footway',
  'service',
]);

const SETTLEMENT_ADDRESS_KEYS = [
  'city',
  'town',
  'village',
  'hamlet',
  'municipality',
  'locality',
  'suburb',
  'borough',
  'province',
  'state',
  'county',
] as const;

export type RecentPlace = Pick<
  Place,
  'place_id' | 'osm_id' | 'name' | 'display_name' | 'lat' | 'lon' | 'addresstype'
>;

export function parseCoord(value?: string | string[] | null): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return null;
  return Number.parseFloat(n.toFixed(5));
}

export function buildPlaceQuery(
  place: Pick<Place, 'name' | 'lat' | 'lon'>,
): string {
  const params = new URLSearchParams({
    place: place.name,
    lat: place.lat,
    lon: place.lon,
  });
  return `?${params.toString()}`;
}

export function isPopulatedPlace(place: Pick<Place, 'class' | 'type' | 'addresstype'>): boolean {
  if (EXCLUDED_PLACE_CLASSES.has(place.class)) {
    return false;
  }

  if (place.type && EXCLUDED_PLACE_TYPES.has(place.type)) {
    return false;
  }

  if (place.class === 'place') {
    return !place.type || POPULATED_PLACE_TYPES.has(place.type);
  }

  if (place.class === 'boundary' && place.type === 'administrative') {
    return Boolean(
      place.addresstype && ADMIN_SETTLEMENT_ADDRESSTYPES.has(place.addresstype),
    );
  }

  return Boolean(
    place.addresstype && ADMIN_SETTLEMENT_ADDRESSTYPES.has(place.addresstype),
  );
}

export function filterPopulatedPlaces(places: Place[]): Place[] {
  return places.filter(isPopulatedPlace);
}

export function normalizeToPopulatedPlace(place: Place): Place | null {
  if (isPopulatedPlace(place)) return place;

  const address = place.address;
  if (!address) return null;

  for (const key of SETTLEMENT_ADDRESS_KEYS) {
    const name = address[key];
    if (!name) continue;

    return {
      ...place,
      name,
      class: 'place',
      type: key,
      addresstype: key,
      display_name: place.display_name.includes(name)
        ? place.display_name
        : `${name}, ${place.display_name}`,
    };
  }

  return null;
}

export function formatPlaceTownCountry(place: Place): string | null {
  const address = place.address;
  const townFromAddress = SETTLEMENT_ADDRESS_KEYS.map((key) => address?.[key]).find(
    Boolean,
  );
  const town = townFromAddress || place.name;
  const country = address?.country;

  if (town && country) {
    return `${town}, ${country}`;
  }

  if (country && place.name) {
    return `${place.name}, ${country}`;
  }

  const parts = place.display_name
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]}, ${parts[parts.length - 1]}`;
  }

  return town || parts[0] || null;
}

export function formatPlaceSuggestionSubtitle(place: Place): string {
  if (place.display_name.startsWith(place.name)) {
    const rest = place.display_name
      .slice(place.name.length)
      .replace(/^,\s*/, '')
      .trim();
    if (rest) return rest;
  }

  return formatPlaceType(place.addresstype) ?? place.type ?? '';
}

export function buildMinimalPlace(
  name: string,
  lat: number,
  lon: number,
): Place {
  return {
    place_id: 0,
    licence: '',
    osm_type: '',
    osm_id: 0,
    lat: normalizeCoordString(lat),
    lon: normalizeCoordString(lon),
    class: '',
    type: '',
    place_rank: 0,
    importance: 0,
    addresstype: '',
    name,
    display_name: name,
    boundingbox: ['0', '0', '0', '0'],
  };
}

export function normalizeCoordString(value: string | number): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toFixed(5);
}

export function toRecentPlace(place: Place): RecentPlace {
  return {
    place_id: place.place_id,
    osm_id: place.osm_id,
    name: place.name.trim(),
    display_name: place.display_name,
    lat: normalizeCoordString(place.lat),
    lon: normalizeCoordString(place.lon),
    addresstype: place.addresstype,
  };
}

export function isSameRecentPlace(a: RecentPlace, b: RecentPlace): boolean {
  if (a.osm_id !== 0 && b.osm_id !== 0 && a.osm_id === b.osm_id) {
    return true;
  }

  return (
    normalizeCoordString(a.lat) === normalizeCoordString(b.lat) &&
    normalizeCoordString(a.lon) === normalizeCoordString(b.lon)
  );
}

function mergeRecentPlace(existing: RecentPlace, incoming: RecentPlace): RecentPlace {
  return {
    ...existing,
    ...incoming,
    name: incoming.name || existing.name,
    osm_id: incoming.osm_id !== 0 ? incoming.osm_id : existing.osm_id,
    place_id: incoming.place_id !== 0 ? incoming.place_id : existing.place_id,
  };
}

export function dedupeRecentPlaces(places: RecentPlace[]): RecentPlace[] {
  const result: RecentPlace[] = [];

  for (const place of places) {
    const normalized = toRecentPlace({
      place_id: place.place_id,
      licence: '',
      osm_type: '',
      osm_id: place.osm_id,
      lat: place.lat,
      lon: place.lon,
      class: '',
      type: '',
      place_rank: 0,
      importance: 0,
      addresstype: place.addresstype,
      name: place.name,
      display_name: place.display_name,
      boundingbox: ['0', '0', '0', '0'],
    });
    const index = result.findIndex((item) => isSameRecentPlace(item, normalized));

    if (index >= 0) {
      result[index] = mergeRecentPlace(result[index], normalized);
    } else {
      result.push(normalized);
    }
  }

  return result.slice(0, RECENT_PLACES_MAX);
}

export function readRecentPlaces(): RecentPlace[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(RECENT_PLACES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as RecentPlace[];
    if (!Array.isArray(parsed)) return [];

    const deduped = dedupeRecentPlaces(parsed);
    writeRecentPlaces(deduped);
    return deduped;
  } catch {
    localStorage.removeItem(RECENT_PLACES_KEY);
    return [];
  }
}

export function writeRecentPlaces(places: RecentPlace[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    RECENT_PLACES_KEY,
    JSON.stringify(dedupeRecentPlaces(places)),
  );
}

export function addRecentPlace(
  places: RecentPlace[],
  place: RecentPlace,
): RecentPlace[] {
  const normalized = toRecentPlace({
    place_id: place.place_id,
    licence: '',
    osm_type: '',
    osm_id: place.osm_id,
    lat: place.lat,
    lon: place.lon,
    class: '',
    type: '',
    place_rank: 0,
    importance: 0,
    addresstype: place.addresstype,
    name: place.name,
    display_name: place.display_name,
    boundingbox: ['0', '0', '0', '0'],
  });
  const filtered = places.filter((item) => !isSameRecentPlace(item, normalized));
  const existing = places.find((item) => isSameRecentPlace(item, normalized));
  const merged = existing ? mergeRecentPlace(existing, normalized) : normalized;

  return dedupeRecentPlaces([merged, ...filtered]);
}

export function rememberRecentPlace(place: Place): RecentPlace[] {
  const next = addRecentPlace(readRecentPlaces(), toRecentPlace(place));
  writeRecentPlaces(next);
  return next;
}

export function rememberRecentPlaceEntry(place: RecentPlace): RecentPlace[] {
  const next = addRecentPlace(readRecentPlaces(), place);
  writeRecentPlaces(next);
  return next;
}

export function removeRecentPlace(place: RecentPlace): RecentPlace[] {
  const next = readRecentPlaces().filter((item) => !isSameRecentPlace(item, place));
  writeRecentPlaces(next);
  return next;
}
