import type { Metadata } from 'next';
import PlaceInput from '@/components/placeInput/PlaceInput';
import WeatherFactsSection from '@/components/weatherfacts/WeatherFactsSection';
import WeatherTop from '@/components/weatherTop/WeatherTop';
import { MAX_PLACE_QUERY_LENGTH, parseLatitude, parseLongitude } from '@/app/utilities/placeSearch';

interface PageProps {
  searchParams: Promise<{
    place?: string | string[];
    lat?: string | string[];
    lon?: string | string[];
  }>;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const place = params?.place;
  const rawPlace = Array.isArray(place) ? (place[0] ?? '') : (place ?? '');
  const placeName = rawPlace.slice(0, MAX_PLACE_QUERY_LENGTH).trim();

  if (placeName) {
    return {
      title: `${placeName} · Weather Now`,
      description: `Live weather updates and forecasts for ${placeName}.`,
    };
  }

  return {
    title: 'Weather Now - Local Forecasts',
    description: 'Live weather updates and forecasts by location.',
  };
}

export default async function Weather({ searchParams }: PageProps) {
  const params = await searchParams;
  const place = params?.place;
  const rawPlace = Array.isArray(place) ? (place[0] ?? '') : (place ?? '');
  const placeData = rawPlace.slice(0, MAX_PLACE_QUERY_LENGTH);
  const lat = parseLatitude(params.lat);
  const lon = parseLongitude(params.lon);

  return (
    <>
      <WeatherTop />
      <PlaceInput />
      {placeData && (
        <WeatherFactsSection placeData={placeData} lat={lat} lon={lon} />
      )}
    </>
  );
}
