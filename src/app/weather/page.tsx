import PlaceInput from '@/components/placeInput/PlaceInput';
import WeatherFactsServer from '@/components/weatherfacts/WeatherFactsServer';
import WeatherTop from '@/components/weatherTop/WeatherTop';

interface PageProps {
  searchParams: { place?: string };
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function Weather({ searchParams }: PageProps) {
  const params = await searchParams;
  const place = params?.place;
  const placeData = Array.isArray(place) ? (place[0] ?? '') : (place ?? '');

  return (
    <>
      <WeatherTop />
      <PlaceInput />
      {placeData && (
        <WeatherFactsServer key={placeData} placeData={placeData} />
      )}
    </>
  );
}
