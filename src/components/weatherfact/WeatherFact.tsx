'use server';

import { getPlaceFree, getWeather } from '@/app/utilities/actions';
import styles from './WeatherFact.module.scss';
import React, { Suspense } from 'react';
import Image from 'next/image';

interface SimplePlaceProps {
  placeData: string;
}

const WeatherFact = async ({ placeData }: SimplePlaceProps) => {
  const weatherCanBeFetched = (await placeData) !== '';
  if (!weatherCanBeFetched) return null;

  console.log('placeData in weatherFact: ', placeData);
  // if (!placeData) return <div>No place provided</div>;

  const places = await getPlaceFree(placeData);
  console.log('place', places);

  if (!places.length) return <div>No place provided</div>;

  // Transform coordinates to number and then to number with two decimals
  const latNum = parseFloat(places[0].lat);
  const lat = parseFloat(latNum.toFixed(2));
  const longNum = parseFloat(places[0].lon);
  const long = parseFloat(longNum.toFixed(2));

  const weather = await getWeather(lat, long);

  const timeseries = weather.properties.timeseries;
  const currentData = timeseries[0].data;
  const in1h = currentData.next_1_hours;

  const instantDetails = currentData.instant.details;
  console.log(instantDetails);

  const units = weather.properties.meta.units;

  // Instant weather facts
  const temp = instantDetails.air_temperature;
  const airPressure = instantDetails.air_pressure_at_sea_level;
  const relativeHumidity = instantDetails.relative_humidity;
  const windSpeed = instantDetails.wind_speed;
  const windDirection = instantDetails.wind_from_direction;
  const cloudAreaFraction = instantDetails.cloud_area_fraction;

  // These are arrays for table/graph
  const allTemperatures = timeseries.map(
    (timestamp) => timestamp.data.instant.details.air_temperature
  );

  const allWindspeeds = timeseries.map(
    (timestamp) => timestamp.data.instant.details.wind_speed
  );

  // console.log(allWindspeeds);

  const weatherIconPath: string =
    '/img/weather-icons/' + in1h.summary.symbol_code + '.svg';

  return (
    <>
      <Suspense
        fallback={
          <div>
            <h1>Loading...</h1>
          </div>
        }
      >
        <h2 suppressHydrationWarning>
          Temperature for: {places[0].display_name}{' '}
        </h2>

        <div className={styles.weather}>
          <div className={styles.weatherCard}>
            {temp && (
              <div className={styles.weatherItem}>
                <div>
                  <span className={styles.weatherItem__value}>{temp}</span>
                  <span className={styles.weatherItem__unit}>
                    {units.air_temperature}
                  </span>
                </div>
                <span className={styles.weatherItem__label}>Temperature</span>
              </div>
            )}

            {airPressure && (
              <div className={styles.weatherItem}>
                <div>
                  <span className={styles.weatherItem__value}>
                    {airPressure}
                  </span>
                  <span className={styles.weatherItem__unit}>
                    {units.air_pressure_at_sea_level}
                  </span>
                </div>
                <span className={styles.weatherItem__label}>Air pressure</span>
              </div>
            )}

            {relativeHumidity && (
              <div className={styles.weatherItem}>
                <div>
                  <span className={styles.weatherItem__value}>
                    {relativeHumidity}
                  </span>
                  <span className={styles.weatherItem__unit}>
                    {units.relative_humidity}
                  </span>
                </div>
                <span className={styles.weatherItem__label}>
                  Relative humidity
                </span>
              </div>
            )}

            {windSpeed && (
              <div className={styles.weatherItem}>
                <div>
                  <span className={styles.weatherItem__value}>{windSpeed}</span>
                  <span className={styles.weatherItem__unit}>
                    {units.wind_speed}
                  </span>
                </div>
                <span className={styles.weatherItem__label}>Wind speed</span>
              </div>
            )}

            {windDirection && (
              <div>
                <Image
                  style={{ transform: `rotate(${windDirection}deg` }}
                  src="/img/arrow-down.svg"
                  alt="weather direction arrow"
                  width={20}
                  height={20}
                />
              </div>
            )}

            {cloudAreaFraction && (
              <div className={styles.weatherItem}>
                <div>
                  <span className={styles.weatherItem__value}>
                    {cloudAreaFraction}
                  </span>
                  <span className={styles.weatherItem__unit}>
                    {units.cloud_area_fraction}
                  </span>
                </div>
                <span className={styles.weatherItem__label}>
                  Cloud area fraction
                </span>
              </div>
            )}

            <Image
              src={weatherIconPath}
              alt="weather description icon"
              width={120}
              height={120}
            />
          </div>
        </div>
      </Suspense>
    </>
  );
};

export default WeatherFact;
