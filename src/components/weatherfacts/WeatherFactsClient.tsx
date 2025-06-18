'use client';
import styles from './WeatherFacts.module.scss';
import React, { Suspense, useState } from 'react';
import dayjs from 'dayjs';
import * as motion from 'motion/react-client';

import relativeTime from 'dayjs/plugin/relativeTime';

import duration from 'dayjs/plugin/duration';
import Image from 'next/image';
import WeatherCard from '../weatherCard/WeatherCard';
import NextCard, { CardInfo } from '../nextCard/NextCard';
import ChartComponent from '../chartComponent/ChartComponent';
import SearchedPlaces from '../searchedPlaces/SearchedPlaces';

type WeatherFactsProps = {
  onePlace: any;
  weather: any;
};

type TimeSeriesItem = {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        [key: string]: number;
      };
    };
    [key: string]: any;
  };
};

const WeatherFactsClient = ({ onePlace, weather }: WeatherFactsProps) => {
  const units = weather.properties.meta.units;
  const timeseries: TimeSeriesItem[] = weather.properties.timeseries;
  const currentData = timeseries[0].data;
  const in1h = currentData.next_1_hours;
  const instantData = currentData.instant.details;

  console.log('Timeseries: ', timeseries);

  const {
    air_temperature,
    air_pressure_at_sea_level,
    relative_humidity,
    wind_speed,
    wind_from_direction,
    cloud_area_fraction,
  } = instantData;

  // Data for nextData cards
  const nextData = Object.entries(currentData)
    .filter(
      ([key]) => key !== 'instant' // Exclude `instant`
    )
    .sort(
      ([a], [b]) => (a === 'next_12_hours' ? 1 : b === 'next_12_hours' ? -1 : 0) //Put object part with specific key "next_12_hours" at the end
    );

  // These are arrays for table/graph
  const allTimes: string[] = timeseries.map(
    (timestamp: { time: string }) => timestamp.time
  );

  dayjs.extend(relativeTime);
  dayjs.extend(duration);

  const getSpecificRelativeTime = (time: string) => {
    const now = dayjs();
    const target = dayjs(time);
    const diffInSeconds = target.diff(now, 'seconds');

    if (diffInSeconds <= 0) {
      return 'now'; // Event already passed
    }

    const d = dayjs.duration(diffInSeconds, 'seconds');
    const days = d.days();
    const hours = d.hours();
    const minutes = d.minutes();

    // Build a human-readable relative time
    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (hours < 1 && minutes > 0)
      parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    return `in ${parts.join(' ')}`;
  };

  const allRelativeTimes = allTimes.map(getSpecificRelativeTime);

  const first24RelativeTimes = allRelativeTimes.filter(
    (time, index) => index < 25
  );

  const next24RelativeTimes = allRelativeTimes.filter(
    (time, index) => index >= 25 && index < 57
  );

  const allTemperatures = timeseries.map(
    (timestamp) => timestamp.data.instant.details.air_temperature
  );

  const first24Temperatures = allTemperatures.filter(
    (time, index) => index < 25
  );

  const next24Temperatures = allTemperatures.filter(
    (time, index) => index >= 25 && index < 57
  );

  const allWindspeeds = timeseries.map(
    (timestamp) => timestamp.data.instant.details.wind_speed
  );

  const allWindDirections = timeseries.map(
    (timestamp) => timestamp.data.instant.details.wind_from_direction
  );

  const first24Windspeeds = allWindspeeds.filter((time, index) => index < 25);
  const next24Windspeeds = allWindspeeds.filter(
    (time, index) => index >= 25 && index < 57
  );

  const first24WindDirections = allWindDirections.filter(
    (time, index) => index < 25
  );

  const next24WindDirections = allWindDirections.filter(
    (time, index) => index >= 25 && index < 57
  );

  const allPrecipitation = timeseries.map(
    (timestamp) => timestamp.data.instant.details
  );

  const first24Precipitation = allPrecipitation.filter(
    (time, index) => index < 25
  );
  const next24Precipitation = allPrecipitation.filter(
    (time, index) => index >= 25 && index < 57
  );

  const allPressure = timeseries.map(
    (timestamp) => timestamp.data.instant.details.air_pressure_at_sea_level
  );

  const first24Pressure = allPressure.filter((time, index) => index < 25);
  const next24Pressure = allPressure.filter(
    (time, index) => index >= 25 && index < 57
  );

  const allHumidity = timeseries.map(
    (timestamp) => timestamp.data.instant.details.relative_humidity
  );

  const first24Humidity = allHumidity.filter((time, index) => index < 25);
  const next24Humidity = allHumidity.filter(
    (time, index) => index >= 25 && index < 57
  );

  const allCloudArea = timeseries.map(
    (timestamp) => timestamp.data.instant.details.cloud_area_fraction
  );

  const first24CloudArea = allCloudArea.filter((time, index) => index < 25);
  const next24CloudArea = allCloudArea.filter(
    (time, index) => index >= 25 && index < 57
  );

  const weatherIconPath: string =
    '/img/weather-icons/' + in1h.summary.symbol_code + '.svg';

  const blueColor = 'rgba(99, 190, 255, 0.7)';
  const orangeColor = 'rgba(240, 188, 54, 0.7)';
  const blackColor = 'rgba(0,0,0, 0.7)';

  const chartData = [
    {
      type: 'line',
      id: 'temperature',
      yAxisLabel: '°C',
      data: {
        labels: first24RelativeTimes,
        datasets: [
          {
            label: 'Temperature',
            data: first24Temperatures,
            borderWidth: 2,
            backgroundColor: first24Temperatures.map((temp) =>
              (temp ?? 0) > 0 ? orangeColor : blueColor
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
        labels: first24RelativeTimes,
        datasets: [
          {
            label: 'Wind Speed',
            data: first24Windspeeds,
            backgroundColor: blackColor,
            borderColor: blackColor,
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
        labels: first24RelativeTimes,
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
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    },
    {
      type: 'bar',
      id: 'pressure',
      yAxisLabel: 'hPa',
      data: {
        labels: first24RelativeTimes,
        datasets: [
          {
            label: 'Air Pressure',
            data: first24Pressure,
            backgroundColor: 'grey',
            borderColor: 'grey',
            borderWidth: 5,
            tension: 0.4,
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 995,
          },
        },
      },
    },
    {
      type: 'bar',
      id: 'cloudarea',
      yAxisLabel: '%',
      data: {
        labels: first24RelativeTimes,
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
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    },
  ];

  const secondChartData = [
    {
      type: 'line',
      id: 'temperature',
      yAxisLabel: '°C',
      data: {
        labels: next24RelativeTimes,
        datasets: [
          {
            label: 'Temperature',
            data: next24Temperatures,
            borderWidth: 2,
            backgroundColor: next24Temperatures.map((temp) =>
              (temp ?? 0) > 0 ? orangeColor : blueColor
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
        labels: next24RelativeTimes,
        datasets: [
          {
            label: 'Wind Speed',
            data: next24Windspeeds,
            backgroundColor: blackColor,
            borderColor: blackColor,
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
        labels: next24RelativeTimes,
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
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    },
    {
      type: 'bar',
      id: 'pressure',
      yAxisLabel: 'hPa',
      data: {
        labels: next24RelativeTimes,
        datasets: [
          {
            label: 'Air Pressure',
            data: next24Pressure,
            backgroundColor: 'grey',
            borderColor: 'grey',
            borderWidth: 5,
            tension: 0.4,
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 995,
          },
        },
      },
    },
    {
      type: 'bar',
      id: 'cloudarea',
      yAxisLabel: '%',
      data: {
        labels: next24RelativeTimes,
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
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    },
  ];

  return (
    <>
      <Suspense>
        <div className={styles.weather}>
          <div className="container">
            <div className={styles.weather__inner}>
              <div className={styles.weather__citywrap}>
                <p className={styles.weather__desc}>
                  Temperature for: {onePlace.display_name}
                </p>
                <motion.div
                  key={onePlace.name}
                  initial={{ opacity: 0, x: -600 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -900 }}
                  className={
                    air_temperature <= 0
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

                <div className={styles.weather__searchItemsList}>
                  <SearchedPlaces place={onePlace} />
                </div>
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

                {air_temperature !== null && (
                  <div className={styles.weather__currentlistitem}>
                    <WeatherCard
                      value={air_temperature}
                      units={units.air_temperature}
                      label="Temperature"
                    />
                  </div>
                )}

                {wind_speed !== null && wind_from_direction !== null && (
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
                    />
                  </div>
                )}

                {cloud_area_fraction !== null && (
                  <div className={styles.weather__currentlistitem}>
                    <WeatherCard
                      value={cloud_area_fraction}
                      units={units.cloud_area_fraction}
                      label="Cloud Area Fraction"
                    />
                  </div>
                )}

                {air_pressure_at_sea_level !== null && (
                  <div className={styles.weather__currentlistitem}>
                    <WeatherCard
                      value={air_pressure_at_sea_level}
                      units={units.air_pressure_at_sea_level}
                      label="Air Pressure"
                    />
                  </div>
                )}

                {relative_humidity !== null && (
                  <div className={styles.weather__currentlistitem}>
                    <WeatherCard
                      value={relative_humidity}
                      units={units.relative_humidity}
                      label="Relative Humidity"
                    />
                  </div>
                )}
              </div>
              <div>
                <h3 className={styles.weather__nexttitle}>
                  Precipitation for next 12 hours
                </h3>

                <div className={styles.weather__nextlist}>
                  {nextData.map(([key, value]) => {
                    const symbolCode = value.summary?.symbol_code ?? 'n/a';
                    const precipitationAmount =
                      value.details?.precipitation_amount;
                    // value.details?.precipitation_amount ?? 'n/a';
                    return (
                      <NextCard
                        key={key}
                        title={key
                          .replace(/_/g, ' ')
                          .replace(/^./, (char) => char.toUpperCase())}
                        image={{
                          src: '/img/weather-icons/' + symbolCode + '.svg',
                          alt: symbolCode,
                        }}
                        precipitation={precipitationAmount}
                        units={units.precipitation_amount}
                      />
                    );
                  })}
                </div>
              </div>
              <ChartComponent
                charts={chartData}
                title="Weather data for next 24 hours"
              />
              <ChartComponent
                charts={secondChartData}
                title="Weather data for next 3 days"
              />
            </div>
          </div>
        </div>
      </Suspense>
    </>
  );
};

export default WeatherFactsClient;
