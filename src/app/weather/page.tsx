import PlaceInput from '@/components/placeInput/PlaceInput';
import WeatherFactsSection from '@/components/weatherfacts/WeatherFactsSection';
import WeatherTop from '@/components/weatherTop/WeatherTop';
import { parseCoord } from '@/app/utilities/placeSearch';

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
  const placeData = Array.isArray(place) ? (place[0] ?? '') : (place ?? '');
  const lat = parseCoord(params.lat);
  const lon = parseCoord(params.lon);

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
