import PlaceInput from '@/components/placeInput/PlaceInput';
import WeatherFactsServer from '@/components/weatherfacts/WeatherFactsServer';
import WeatherTop from '@/components/weatherTop/WeatherTop';
import Loader from '@/app/weather/loading';
import { Suspense } from 'react';

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
        <Suspense
          key={placeData}
          fallback={
            <div className="container">
              <Loader />
            </div>
          }
        >
          <WeatherFactsServer placeData={placeData} />
        </Suspense>
      )}
    </>
  );
}
