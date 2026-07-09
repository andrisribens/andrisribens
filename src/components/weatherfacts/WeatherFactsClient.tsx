'use client';

import styles from './WeatherFacts.module.scss';
import React, { Suspense } from 'react';
import dayjs from 'dayjs';
import * as motion from 'motion/react-client';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import WeatherCard from '../weatherCard/WeatherCard';
import NextCard from '../nextCard/NextCard';
import ChartComponent from '../chartComponent/ChartComponent';
import InsightCard from '../insightCard/InsightCard';
import insightStyles from '../insightCard/InsightCard.module.scss';
import DaylightCard from '../daylightCard/DaylightCard';
import Loader from '@/app/weather/loading';
import {
  type ForecastPeriod,
  type WeatherData,
  formatCoord,
  getComfortInsight,
  getUvInsight,
  getUvChartColor,
  getWindFeelLabel,
  getWindLevel,
} from '@/app/utilities/weatherTypes';
import type { DaylightData, Place } from '@/app/utilities/actions';
import {
  getMoonPhaseLabel,
  getMoonPhaseIcon,
  getNextSunEvent,
  getSunEventIcon,
} from '@/app/utilities/sunriseTypes';
import {
  formatChartTimeLabels,
  formatPlaceTime,
  getPlaceTimezone,
  getPlaceTimezoneLabel,
} from '@/app/utilities/chartLabels';
import { formatPlaceTownCountry } from '@/app/utilities/placeSearch';

dayjs.extend(relativeTime);

type WeatherFactsProps = {
  onePlace: Place;
  weather: WeatherData;
  daylight?: DaylightData | null;
  isLoading?: boolean;
  error?: string | null;
};

const WeatherFactsClient = ({
  onePlace,
  weather,
  daylight = null,
  isLoading = false,
  error = null,
}: WeatherFactsProps) => {
  const units = weather.properties.meta.units;
  const timeseries = weather.properties.timeseries;
  const updatedAt = weather.properties.meta.updated_at;
  const forecastCoords = weather.geometry?.coordinates;

  const currentData = timeseries[0]?.data;
  const in1h = currentData?.next_1_hours;
  const instantData = currentData?.instant?.details;

  if (!currentData || !instantData) {
    return <div>No weather data available.</div>;
  }

  const {
    air_temperature,
    air_pressure_at_sea_level,
    relative_humidity,
    wind_speed,
    wind_from_direction,
    cloud_area_fraction,
    dew_point_temperature,
    ultraviolet_index_clear_sky,
    wind_speed_of_gust,
  } = instantData;

  const comfortInsight =
    dew_point_temperature != null
      ? getComfortInsight(dew_point_temperature)
      : null;

  const uvInsight =
    ultraviolet_index_clear_sky != null
      ? getUvInsight(ultraviolet_index_clear_sky)
      : null;

  const comfortDetail =
    dew_point_temperature != null && relative_humidity != null
      ? `Dew point ${dew_point_temperature}°C · Humidity ${relative_humidity}%`
      : dew_point_temperature != null
        ? `Dew point ${dew_point_temperature}°C`
        : undefined;

  const windDetail =
    wind_speed != null
      ? wind_speed_of_gust != null
        ? `${wind_speed} ${units.wind_speed} · gusts ${wind_speed_of_gust} ${units.wind_speed_of_gust}`
        : `${wind_speed} ${units.wind_speed}`
      : undefined;

  const showInsights =
    comfortInsight != null ||
    ultraviolet_index_clear_sky != null ||
    wind_speed != null;

  const placeTownCountry = formatPlaceTownCountry(onePlace);
  const placeLat = Number.parseFloat(onePlace.lat);
  const placeLon = Number.parseFloat(onePlace.lon);
  const placeCoordsLabel =
    Number.isFinite(placeLat) && Number.isFinite(placeLon)
      ? `${formatCoord(placeLat)}°, ${formatCoord(placeLon)}°`
      : null;

  const forecastLat = forecastCoords?.[1] ?? placeLat;
  const forecastLon = forecastCoords?.[0] ?? placeLon;
  const placeTimezone =
    getPlaceTimezone(forecastLat, forecastLon) ??
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const sunProperties = daylight?.sun.properties;
  const moonProperties = daylight?.moon.properties;
  const sunriseTime = sunProperties?.sunrise?.time;
  const sunsetTime = sunProperties?.sunset?.time;
  const nextSunEvent = getNextSunEvent(sunriseTime, sunsetTime);
  const sunriseLabel = formatPlaceTime(sunriseTime, placeTimezone);
  const sunsetLabel = formatPlaceTime(sunsetTime, placeTimezone);
  const sunDetail = [sunriseLabel && `Sunrise ${sunriseLabel}`, sunsetLabel && `Sunset ${sunsetLabel}`]
    .filter(Boolean)
    .join(' · ');
  const moonPhase = getMoonPhaseLabel(moonProperties?.moonphase);
  const moonriseLabel = formatPlaceTime(moonProperties?.moonrise?.time, placeTimezone);
  const moonsetLabel = formatPlaceTime(moonProperties?.moonset?.time, placeTimezone);
  const moonDetail = [
    moonriseLabel && `Moonrise ${moonriseLabel}`,
    moonsetLabel && `Moonset ${moonsetLabel}`,
  ]
    .filter(Boolean)
    .join(' · ');
  const showDaylight = Boolean(nextSunEvent || moonPhase);

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  const getCompassLabel = (angle?: number) => {
    if (typeof angle !== 'number') return '';
    return directions[Math.round(angle / 45) % 8];
  };

  const wind_from_direction_label = getCompassLabel(wind_from_direction);

  const nextData = Object.entries(currentData)
    .filter(([key]) => key !== 'instant')
    .sort(([a], [b]) =>
      a === 'next_12_hours' ? 1 : b === 'next_12_hours' ? -1 : 0,
    ) as [string, ForecastPeriod][];

  const allTimes = timeseries.map((timestamp) => timestamp.time);
  const chartTimezoneLabel = getPlaceTimezoneLabel(
    placeTimezone,
    onePlace.name,
  );

  const allChartTimeLabels = formatChartTimeLabels(allTimes, placeTimezone);

  const first24ChartLabels = allChartTimeLabels.filter((_, index) => index < 25);
  const next24ChartLabels = allChartTimeLabels.filter(
    (_, index) => index >= 25 && index < 57,
  );

  const allTemperatures = timeseries.map(
    (timestamp) => timestamp.data.instant.details.air_temperature ?? null,
  );

  const first24Temperatures = allTemperatures.filter((_, index) => index < 25);
  const next24Temperatures = allTemperatures.filter(
    (_, index) => index >= 25 && index < 57,
  );

  const allWindspeeds = timeseries.map(
    (timestamp) => timestamp.data.instant.details.wind_speed ?? null,
  );

  const allWindDirections = timeseries.map(
    (timestamp) => timestamp.data.instant.details.wind_from_direction ?? null,
  );

  const first24Windspeeds = allWindspeeds.filter((_, index) => index < 25);
  const next24Windspeeds = allWindspeeds.filter(
    (_, index) => index >= 25 && index < 57,
  );

  const first24WindDirections = allWindDirections.filter(
    (_, index) => index < 25,
  );
  const next24WindDirections = allWindDirections.filter(
    (_, index) => index >= 25 && index < 57,
  );

  const allPressure = timeseries.map(
    (timestamp) =>
      timestamp.data.instant.details.air_pressure_at_sea_level ?? null,
  );

  const first24Pressure = allPressure.filter((_, index) => index < 25);
  const next24Pressure = allPressure.filter(
    (_, index) => index >= 25 && index < 57,
  );

  const allHumidity = timeseries.map(
    (timestamp) => timestamp.data.instant.details.relative_humidity ?? null,
  );

  const first24Humidity = allHumidity.filter((_, index) => index < 25);
  const next24Humidity = allHumidity.filter(
    (_, index) => index >= 25 && index < 57,
  );

  const allCloudArea = timeseries.map(
    (timestamp) => timestamp.data.instant.details.cloud_area_fraction ?? null,
  );

  const first24CloudArea = allCloudArea.filter((_, index) => index < 25);
  const next24CloudArea = allCloudArea.filter(
    (_, index) => index >= 25 && index < 57,
  );

  const allGusts = timeseries.map(
    (timestamp) => timestamp.data.instant.details.wind_speed_of_gust ?? null,
  );

  const first24Gusts = allGusts.filter((_, index) => index < 25);
  const next24Gusts = allGusts.filter((_, index) => index >= 25 && index < 57);

  const allUv = timeseries.map(
    (timestamp) =>
      timestamp.data.instant.details.ultraviolet_index_clear_sky ?? null,
  );

  const first24Uv = allUv.filter((_, index) => index < 25);
  const next24Uv = allUv.filter((_, index) => index >= 25 && index < 57);

  const allPrecipProb = timeseries.map(
    (timestamp) =>
      timestamp.data.next_1_hours?.details?.probability_of_precipitation ?? null,
  );

  const first24PrecipProb = allPrecipProb.filter((_, index) => index < 25);
  const next24PrecipProb = allPrecipProb.filter(
    (_, index) => index >= 25 && index < 57,
  );

  const uvPointColors = first24Uv.map((uv) => getUvChartColor(uv));
  const nextUvPointColors = next24Uv.map((uv) => getUvChartColor(uv));

  const weatherIconPath = `/img/weather-icons/${in1h?.summary?.symbol_code ?? 'clearsky_day'}.svg`;

  const blueColor = 'rgba(99, 190, 255, 0.7)';
  const blueLightColor = 'rgba(170, 220, 255, 0.85)';
  const orangeColor = 'rgba(240, 188, 54, 0.7)';
  const blackColor = 'rgba(0,0,0, 0.7)';

  const chartData = [
    {
      type: 'line',
      id: 'temperature',
      yAxisLabel: '°C',
      data: {
        labels: first24ChartLabels,
        datasets: [
          {
            label: 'Temperature',
            data: first24Temperatures,
            borderWidth: 2,
            backgroundColor: first24Temperatures.map((temp) =>
              (temp ?? 0) > 0 ? orangeColor : blueColor,
            ),
            tension: 0.4,
            fill: { target: 'origin', above: orangeColor, below: blueColor },
            pointStyle: 'circle',
            pointRadius: 6,
            pointHoverRadius: 12,
            hitRadius: 2,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'wind',
      yAxisLabel: 'm/s',
      data: {
        labels: first24ChartLabels,
        datasets: [
          {
            label: 'Wind Speed',
            data: first24Windspeeds,
            backgroundColor: blueLightColor,
            borderColor: blueLightColor,
            borderWidth: 5,
            tension: 0.4,
            windDirections: first24WindDirections,
          },
        ],
      },
      options: {
        plugins: {
          chartId: 'wind',
        },
      },
    },
    {
      type: 'line',
      id: 'humidity',
      yAxisLabel: '%',
      data: {
        labels: first24ChartLabels,
        datasets: [
          {
            label: 'Relative Humidity',
            data: first24Humidity,
            backgroundColor: blueColor,
            borderColor: blueColor,
            borderWidth: 3,
            tension: 0.4,
            pointStyle: 'circle',
            pointRadius: 5,
            pointHoverRadius: 10,
            hitRadius: 2,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'pressure',
      yAxisLabel: 'hPa',
      data: {
        labels: first24ChartLabels,
        datasets: [
          {
            label: 'Air Pressure',
            data: first24Pressure,
            backgroundColor: blueLightColor,
            borderColor: blueLightColor,
            borderWidth: 5,
            tension: 0.4,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'cloudarea',
      yAxisLabel: '%',
      data: {
        labels: first24ChartLabels,
        datasets: [
          {
            label: 'Cloud Area Fraction',
            data: first24CloudArea,
            backgroundColor: blueColor,
            borderColor: blueColor,
            borderWidth: 5,
            tension: 0.4,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'precipprob',
      yAxisLabel: '%',
      data: {
        labels: first24ChartLabels,
        datasets: [
          {
            label: 'Rain Chance',
            data: first24PrecipProb,
            backgroundColor: blueColor,
            borderColor: blueColor,
            borderWidth: 5,
            tension: 0.4,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'uv',
      yAxisLabel: 'UV',
      data: {
        labels: first24ChartLabels,
        datasets: [
          {
            label: 'UV Index',
            data: first24Uv,
            backgroundColor: uvPointColors,
            borderColor: uvPointColors,
            borderWidth: 5,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'gust',
      yAxisLabel: 'm/s',
      data: {
        labels: first24ChartLabels,
        datasets: [
          {
            label: 'Wind Gusts',
            data: first24Gusts,
            backgroundColor: blackColor,
            borderColor: blackColor,
            borderWidth: 5,
            tension: 0.4,
          },
        ],
      },
    },
  ];

  const secondChartData = [
    {
      type: 'line',
      id: 'temperature',
      yAxisLabel: '°C',
      data: {
        labels: next24ChartLabels,
        datasets: [
          {
            label: 'Temperature',
            data: next24Temperatures,
            borderWidth: 2,
            backgroundColor: next24Temperatures.map((temp) =>
              (temp ?? 0) > 0 ? orangeColor : blueColor,
            ),
            tension: 0.4,
            fill: { target: 'origin', above: orangeColor, below: blueColor },
            pointStyle: 'circle',
            pointRadius: 6,
            pointHoverRadius: 12,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'wind',
      yAxisLabel: 'm/s',
      data: {
        labels: next24ChartLabels,
        datasets: [
          {
            label: 'Wind Speed',
            data: next24Windspeeds,
            backgroundColor: blueLightColor,
            borderColor: blueLightColor,
            borderWidth: 5,
            tension: 0.4,
            windDirections: next24WindDirections,
          },
        ],
      },
    },
    {
      type: 'line',
      id: 'humidity',
      yAxisLabel: '%',
      data: {
        labels: next24ChartLabels,
        datasets: [
          {
            label: 'Relative Humidity',
            data: next24Humidity,
            backgroundColor: blueColor,
            borderColor: blueColor,
            borderWidth: 3,
            tension: 0.4,
            pointStyle: 'circle',
            pointRadius: 5,
            pointHoverRadius: 10,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'pressure',
      yAxisLabel: 'hPa',
      data: {
        labels: next24ChartLabels,
        datasets: [
          {
            label: 'Air Pressure',
            data: next24Pressure,
            backgroundColor: blueLightColor,
            borderColor: blueLightColor,
            borderWidth: 5,
            tension: 0.4,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'cloudarea',
      yAxisLabel: '%',
      data: {
        labels: next24ChartLabels,
        datasets: [
          {
            label: 'Cloud Area Fraction',
            data: next24CloudArea,
            backgroundColor: blueColor,
            borderColor: blueColor,
            borderWidth: 3,
            tension: 0.4,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'precipprob',
      yAxisLabel: '%',
      data: {
        labels: next24ChartLabels,
        datasets: [
          {
            label: 'Rain Chance',
            data: next24PrecipProb,
            backgroundColor: blueColor,
            borderColor: blueColor,
            borderWidth: 5,
            tension: 0.4,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'uv',
      yAxisLabel: 'UV',
      data: {
        labels: next24ChartLabels,
        datasets: [
          {
            label: 'UV Index',
            data: next24Uv,
            backgroundColor: nextUvPointColors,
            borderColor: nextUvPointColors,
            borderWidth: 5,
          },
        ],
      },
    },
    {
      type: 'bar',
      id: 'gust',
      yAxisLabel: 'm/s',
      data: {
        labels: next24ChartLabels,
        datasets: [
          {
            label: 'Wind Gusts',
            data: next24Gusts,
            backgroundColor: blackColor,
            borderColor: blackColor,
            borderWidth: 5,
            tension: 0.4,
          },
        ],
      },
    },
  ];

  return (
    <Suspense>
      <div className={styles.weather}>
        <div className="container">
          <div className={styles.weather__inner}>
            <div className={styles.weather__hero}>
              <div className={styles.weather__citywrap}>
                {placeTownCountry && (
                  <p className={styles.weather__desc}>{placeTownCountry}</p>
                )}

                <motion.div
                  key={onePlace.name}
                  initial={{ opacity: 0, x: -600 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -900 }}
                  className={
                    (air_temperature ?? 0) <= 0
                      ? `${styles.weather__city} ${styles.cold}`
                      : styles.weather__city
                  }
                  transition={{
                    duration: 3,
                    ease: [0, 0.71, 0.2, 1.01],
                    bounce: 0.25,
                  }}
                >
                  <h2>{onePlace.name}</h2>
                </motion.div>

                {placeCoordsLabel && (
                  <p className={styles.weather__placecoords}>{placeCoordsLabel}</p>
                )}
              </div>

              <div className={styles.weather__currentlist}>
              <div className={styles.weather__currentlistitem}>
                <Image
                  className={styles.weather__image}
                  src={weatherIconPath}
                  alt="weather description icon"
                  width={240}
                  height={240}
                />
              </div>

              {air_temperature != null && (
                <div className={styles.weather__currentlistitem}>
                  <WeatherCard
                    value={air_temperature}
                    units={units.air_temperature}
                    label="Temperature"
                  />
                </div>
              )}

              {wind_speed != null && wind_from_direction != null && (
                <div className={styles.weather__currentlistitem}>
                  <WeatherCard
                    value={wind_speed}
                    units={units.wind_speed}
                    label="Wind Speed"
                    image={{
                      windDirection: wind_from_direction,
                      src: '/img/arrow-down.svg',
                      alt: 'Weather Direction Arrow',
                    }}
                    windDirectionLabel={wind_from_direction_label}
                  />
                </div>
              )}

              {cloud_area_fraction != null && (
                <div className={styles.weather__currentlistitem}>
                  <WeatherCard
                    value={cloud_area_fraction}
                    units={units.cloud_area_fraction}
                    label="Cloud Area Fraction"
                  />
                </div>
              )}

              {air_pressure_at_sea_level != null && (
                <div className={styles.weather__currentlistitem}>
                  <WeatherCard
                    value={air_pressure_at_sea_level}
                    units={units.air_pressure_at_sea_level}
                    label="Air Pressure"
                  />
                </div>
              )}

              {relative_humidity != null && (
                <div className={styles.weather__currentlistitem}>
                  <WeatherCard
                    value={relative_humidity}
                    units={units.relative_humidity}
                    label="Relative Humidity"
                  />
                </div>
              )}
              </div>

              {showInsights && (
                <div className={styles.weather__insights}>
                  <h3 className={styles.weather__sectiontitle}>
                    How it feels right now
                  </h3>

                  <div className={styles.weather__insightlist}>
                  {comfortInsight && (
                    <InsightCard
                      title="Comfort"
                      headline={comfortInsight.label}
                      detail={comfortDetail}
                      level={comfortInsight.level}
                    />
                  )}

                  {uvInsight && ultraviolet_index_clear_sky != null && (
                    <InsightCard
                      title="UV index"
                      headline={uvInsight.label}
                      detail={ultraviolet_index_clear_sky.toFixed(1)}
                      level={uvInsight.level}
                    />
                  )}

                  {wind_speed != null && (
                    <InsightCard
                      title="Wind feel"
                      headline={getWindFeelLabel(
                        wind_speed,
                        wind_speed_of_gust,
                      )}
                      detail={windDetail}
                      level={getWindLevel(wind_speed, wind_speed_of_gust)}
                      icon={
                        wind_from_direction != null ? (
                          <Image
                            className={insightStyles.insightCard__windIcon}
                            style={{
                              transform: `rotate(${wind_from_direction}deg)`,
                            }}
                            src="/img/arrow-down.svg"
                            alt=""
                            width={48}
                            height={48}
                          />
                        ) : undefined
                      }
                    />
                  )}
                </div>
                </div>
              )}

              {showDaylight && (
                <div className={styles.weather__daylight}>
                  <h3 className={styles.weather__sectiontitle}>Sun & moon</h3>

                  <div className={styles.weather__daylightlist}>
                    {nextSunEvent && (
                      <DaylightCard
                        title="Sun"
                        headline={`${nextSunEvent.label} ${nextSunEvent.detail}`}
                        detail={sunDetail || undefined}
                        iconSrc={getSunEventIcon(nextSunEvent.label)}
                        iconAlt={nextSunEvent.label}
                        variant="sun"
                      />
                    )}

                    {moonPhase && (
                      <DaylightCard
                        title="Moon"
                        headline={moonPhase}
                        detail={moonDetail || undefined}
                        iconSrc={getMoonPhaseIcon(moonProperties?.moonphase)}
                        iconAlt={moonPhase}
                        variant="moon"
                      />
                    )}
                  </div>
                </div>
              )}

              {isLoading && (
                <div
                  className={styles.weather__heroOverlay}
                  aria-busy="true"
                  aria-live="polite"
                >
                  <Loader />
                </div>
              )}

              {error && !isLoading && (
                <p className={styles.weather__heroError} role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className={styles.weather__section}>
              <h3 className={styles.weather__sectiontitle}>
                Precipitation forecast for next 12 hours
              </h3>

              <div className={styles.weather__nextlist}>
                {nextData.map(([key, value]) => {
                  const symbolCode = value.summary?.symbol_code ?? 'n/a';
                  const details = value.details;

                  return (
                    <NextCard
                      key={key}
                      title={key
                        .replace(/_/g, ' ')
                        .replace(/^./, (char) => char.toUpperCase())}
                      image={{
                        src: `/img/weather-icons/${symbolCode}.svg`,
                        alt: symbolCode,
                      }}
                      precipitation={details?.precipitation_amount}
                      precipitationMin={details?.precipitation_amount_min}
                      precipitationMax={details?.precipitation_amount_max}
                      probabilityOfPrecipitation={
                        details?.probability_of_precipitation
                      }
                      probabilityOfThunder={details?.probability_of_thunder}
                      temperatureMin={details?.air_temperature_min}
                      temperatureMax={details?.air_temperature_max}
                      units={units.precipitation_amount}
                      temperatureUnits={units.air_temperature}
                    />
                  );
                })}
              </div>
            </div>

            <ChartComponent
              charts={chartData}
              title="Weather data for next 24 hours"
              timezoneLabel={chartTimezoneLabel}
            />

            <ChartComponent
              charts={secondChartData}
              title="Weather data for next 3 days"
              timezoneLabel={chartTimezoneLabel}
            />

            <p className={styles.weather__meta}>
              {Number.isFinite(forecastLat) && Number.isFinite(forecastLon) && (
                <span>
                  Forecast point: {formatCoord(forecastLat)},{' '}
                  {formatCoord(forecastLon)}
                </span>
              )}
              {updatedAt && (
                <span>
                  {Number.isFinite(forecastLat) && ' · '}
                  Updated {dayjs(updatedAt).fromNow()}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default WeatherFactsClient;
