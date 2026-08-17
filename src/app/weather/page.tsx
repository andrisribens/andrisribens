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
