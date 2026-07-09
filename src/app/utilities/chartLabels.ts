import tzlookup from 'tz-lookup';

function getCalendarDayKey(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

function formatTimeInZone(
  iso: string,
  timeZone: string,
  includeWeekday: boolean,
): string {
  const date = new Date(iso);

  if (includeWeekday) {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function getPlaceTimezone(lat: number, lon: number): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  try {
    return tzlookup(lat, lon);
  } catch {
    return null;
  }
}

export function getPlaceTimezoneOffset(
  timeZone: string,
  date = new Date(),
): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  }).formatToParts(date);

  const raw =
    parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const match = raw.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);

  if (!match) return '+00:00';

  const sign = match[1];
  const hours = match[2].padStart(2, '0');
  const minutes = (match[3] ?? '00').padStart(2, '0');

  return `${sign}${hours}:${minutes}`;
}

export function getPlaceDateString(
  timeZone: string,
  date = new Date(),
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatPlaceTime(iso?: string, timeZone?: string): string | null {
  if (!iso || !timeZone) return null;

  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

/** Format API timestamps as clock labels in the searched place's timezone. */
export function formatChartTimeLabels(
  times: string[],
  timeZone: string,
): string[] {
  return times.map((time, index) => {
    const includeWeekday =
      index === 0 ||
      getCalendarDayKey(time, timeZone) !==
        getCalendarDayKey(times[index - 1], timeZone);

    return formatTimeInZone(time, timeZone, includeWeekday);
  });
}

export function getPlaceTimezoneLabel(
  timeZone: string,
  placeName?: string,
): string {
  const offset =
    new Intl.DateTimeFormat(undefined, {
      timeZone,
      timeZoneName: 'shortGeneric',
    })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value ?? '';

  const prefix = placeName ? `Times in ${placeName}` : 'Local times';

  return offset ? `${prefix} · ${offset}` : `${prefix} · ${timeZone}`;
}
