export interface SunEvent {
  time?: string;
  azimuth?: number;
}

export interface SunTimesProperties {
  body: 'Sun';
  sunrise?: SunEvent;
  sunset?: SunEvent;
  solarnoon?: SunEvent & { disc_centre_elevation?: number; visible?: boolean };
  solarmidnight?: SunEvent & { disc_centre_elevation?: number; visible?: boolean };
}

export interface MoonTimesProperties {
  body: 'Moon';
  moonrise?: SunEvent;
  moonset?: SunEvent;
  high_moon?: SunEvent & { disc_centre_elevation?: number; visible?: boolean };
  low_moon?: SunEvent & { disc_centre_elevation?: number; visible?: boolean };
  moonphase?: number;
}

export interface SunriseFeature<T> {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: T;
}

export interface DaylightData {
  sun: SunriseFeature<SunTimesProperties>;
  moon: SunriseFeature<MoonTimesProperties>;
}

export function formatPlaceType(addresstype?: string): string | null {
  if (!addresstype) return null;
  return addresstype
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getMoonPhaseLabel(phase?: number): string | null {
  if (phase == null) return null;

  const normalized = ((phase % 360) + 360) % 360;

  if (normalized < 22.5 || normalized >= 337.5) return 'New moon';
  if (normalized < 67.5) return 'Waxing crescent';
  if (normalized < 112.5) return 'First quarter';
  if (normalized < 157.5) return 'Waxing gibbous';
  if (normalized < 202.5) return 'Full moon';
  if (normalized < 247.5) return 'Waning gibbous';
  if (normalized < 292.5) return 'Last quarter';
  return 'Waning crescent';
}

export type MoonPhaseKey =
  | 'new-moon'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full-moon'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

const MOON_PHASE_LABEL_TO_KEY: Record<string, MoonPhaseKey> = {
  'New moon': 'new-moon',
  'Waxing crescent': 'waxing-crescent',
  'First quarter': 'first-quarter',
  'Waxing gibbous': 'waxing-gibbous',
  'Full moon': 'full-moon',
  'Waning gibbous': 'waning-gibbous',
  'Last quarter': 'last-quarter',
  'Waning crescent': 'waning-crescent',
};

export function getMoonPhaseKey(phase?: number): MoonPhaseKey | null {
  const label = getMoonPhaseLabel(phase);
  if (!label) return null;
  return MOON_PHASE_LABEL_TO_KEY[label] ?? null;
}

export function getMoonPhaseIcon(phase?: number): string {
  const key = getMoonPhaseKey(phase) ?? 'full-moon';
  return `/img/moon-phases/${key}.svg`;
}

export function getNextSunEvent(
  sunrise?: string,
  sunset?: string,
  now = new Date(),
): { label: string; detail: string } | null {
  if (!sunrise && !sunset) return null;

  const sunriseTime = sunrise ? new Date(sunrise) : null;
  const sunsetTime = sunset ? new Date(sunset) : null;

  if (sunriseTime && now < sunriseTime) {
    return {
      label: 'Sunrise',
      detail: formatEventCountdown(sunriseTime, now),
    };
  }

  if (sunsetTime && now < sunsetTime) {
    return {
      label: 'Sunset',
      detail: formatEventCountdown(sunsetTime, now),
    };
  }

  if (sunriseTime) {
    const tomorrowSunrise = new Date(sunriseTime);
    tomorrowSunrise.setDate(tomorrowSunrise.getDate() + 1);
    return {
      label: 'Sunrise',
      detail: formatEventCountdown(tomorrowSunrise, now),
    };
  }

  return null;
}

function formatEventCountdown(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'now';

  const totalMinutes = Math.round(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `in ${hours}h ${minutes}m`;
  if (hours > 0) return `in ${hours}h`;
  return `in ${minutes}m`;
}

export function getSunEventIcon(label: string): string {
  return label === 'Sunset'
    ? '/img/weather-icons/clearsky_polartwilight.svg'
    : '/img/weather-icons/clearsky_day.svg';
}
