export interface InstantWeatherDetails {
  air_pressure_at_sea_level?: number;
  air_temperature?: number;
  cloud_area_fraction?: number;
  cloud_area_fraction_high?: number;
  cloud_area_fraction_low?: number;
  cloud_area_fraction_medium?: number;
  dew_point_temperature?: number;
  fog_area_fraction?: number;
  relative_humidity?: number;
  ultraviolet_index_clear_sky?: number;
  wind_from_direction?: number;
  wind_speed?: number;
  wind_speed_of_gust?: number;
}

export interface PeriodWeatherDetails {
  air_temperature_max?: number;
  air_temperature_min?: number;
  precipitation_amount?: number;
  precipitation_amount_max?: number;
  precipitation_amount_min?: number;
  probability_of_precipitation?: number;
  probability_of_thunder?: number;
  ultraviolet_index_clear_sky_max?: number;
}

export interface ForecastPeriod {
  summary?: { symbol_code?: string };
  details?: PeriodWeatherDetails;
}

export interface TimeSeriesItem {
  time: string;
  data: {
    instant: {
      details: InstantWeatherDetails;
    };
    next_1_hours?: ForecastPeriod;
    next_6_hours?: ForecastPeriod;
    next_12_hours?: ForecastPeriod;
    [key: string]: unknown;
  };
}

export interface WeatherData {
  type?: string;
  geometry?: {
    type: string;
    coordinates: [number, number] | [number, number, number];
  };
  properties: {
    meta: {
      updated_at?: string;
      units: Record<string, string>;
    };
    timeseries: TimeSeriesItem[];
  };
}

export type InsightLevel = 'green' | 'yellow' | 'red';

export const INSIGHT_LEVEL_CHART_COLORS: Record<InsightLevel, string> = {
  green: 'rgba(47, 158, 82, 0.85)',
  yellow: 'rgba(240, 180, 41, 0.85)',
  red: 'rgba(217, 72, 72, 0.85)',
};

export function getComfortInsight(dewPoint: number): {
  label: string;
  level: InsightLevel;
} {
  if (dewPoint < 10) return { label: 'Dry', level: 'green' };
  if (dewPoint < 12) return { label: 'Very comfortable', level: 'green' };
  if (dewPoint < 16) return { label: 'Comfortable', level: 'green' };
  if (dewPoint < 18) return { label: 'A bit humid', level: 'yellow' };
  if (dewPoint < 21) return { label: 'Humid', level: 'yellow' };
  if (dewPoint < 24) return { label: 'Very humid', level: 'red' };
  return { label: 'Oppressive', level: 'red' };
}

export function getUvInsight(index: number): {
  label: string;
  level: InsightLevel;
} {
  if (index <= 2) return { label: 'Low', level: 'green' };
  if (index <= 5) return { label: 'Moderate', level: 'yellow' };
  if (index <= 7) return { label: 'High', level: 'red' };
  if (index <= 10) return { label: 'Very high', level: 'red' };
  return { label: 'Extreme', level: 'red' };
}

export function getUvChartColor(index: number | null | undefined): string {
  if (index == null || Number.isNaN(index)) {
    return 'rgba(150, 150, 150, 0.5)';
  }

  return INSIGHT_LEVEL_CHART_COLORS[getUvInsight(index).level];
}

const WIND_FEEL_LABELS = [
  'Calm',
  'Light breeze',
  'Breezy',
  'Windy',
  'Strong wind',
  'Very windy',
] as const;

const WIND_THRESHOLDS = [2, 5, 8, 11, 14];

function getWindLevelIndex(speed: number, gust?: number): number {
  let level = 0;
  for (let i = WIND_THRESHOLDS.length - 1; i >= 0; i--) {
    if (speed >= WIND_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }

  if (gust != null && gust >= speed * 1.5 && level < WIND_FEEL_LABELS.length - 1) {
    level += 1;
  }

  return Math.min(level, WIND_FEEL_LABELS.length - 1);
}

export function getWindFeelLabel(speed: number, gust?: number): string {
  return WIND_FEEL_LABELS[getWindLevelIndex(speed, gust)];
}

export function getWindLevel(speed: number, gust?: number): InsightLevel {
  const index = getWindLevelIndex(speed, gust);
  if (index <= 1) return 'green';
  if (index <= 3) return 'yellow';
  return 'red';
}

/** @deprecated Use getUvInsight */
export function getUvLabel(index: number): string {
  return getUvInsight(index).label;
}

export function formatCoord(value: number): string {
  return value.toFixed(2);
}
