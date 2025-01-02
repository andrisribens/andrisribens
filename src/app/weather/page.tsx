import PlaceInput from '@/components/placeInput/PlaceInput';
import WeatherFact from '@/components/weatherfact/WeatherFact';

export default async function Weather({
  searchParams,
}: {
  searchParams: { place?: string };
}) {
  const data = await searchParams;

  const placeData = data.place ? data.place : '';
  console.log('placeData incoming:', placeData);
  return (
    <>
      <PlaceInput />
      {placeData && <WeatherFact placeData={placeData} />}
    </>
  );
}
