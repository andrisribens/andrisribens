import PlaceInput from '@/components/placeInput/PlaceInput';
import WeatherFactsServer from '@/components/weatherfacts/WeatherFactsServer';
import WeatherTop from '@/components/weatherTop/WeatherTop';

interface PageProps {
  searchParams: { place?: string };
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function Weather({ searchParams }: PageProps) {
  const placeData = searchParams?.place ?? '';

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
