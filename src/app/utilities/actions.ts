'use server';

// Get Weather data
interface WeatherDetails {
  air_pressure_at_sea_level?: number;
  air_temperature?: number;
  cloud_area_fraction?: number;
  relative_humidity?: number;
  wind_from_direction?: number;
  wind_speed?: number;
  precipitation_amount?: number;
}

interface Timeseries {
  time: string;
  data: {
    instant: {
      details: WeatherDetails;
    };
    next_1_hours: {
      summary: { symbol_code: string };
      details: WeatherDetails;
    };
    next_6_hours: {
      summary: { symbol_code: string };
      details: WeatherDetails;
    };
  };
}

interface WeatherData {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    meta: {
      updated_at: string;
      units: Record<string, string>;
    };
    timeseries: Timeseries[];
  };
}

export async function getWeather(
  lat: number,
  long: number,
): Promise<WeatherData> {
  const url = `${process.env.NEXT_PUBLIC_WEATHER_API_URL}?lat=${lat}&lon=${long}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
      },
    });

    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();

    console.log('[MET] url:', url);
    console.log('[MET] status:', res.status);
    console.log('[MET] content-type:', contentType);
    console.log('[MET] body head:', raw.slice(0, 300));

    if (!res.ok) {
      throw new Error(`Failed to fetch weather data: ${res.status}`);
    }

    const weather = JSON.parse(raw) as WeatherData;
    return weather;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

// Get Place data

interface Place {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: [string, string, string, string];
}

// Get Place by using structured search "city"
export async function getPlaceStructured(placeQuery: string): Promise<Place[]> {
  const url: string =
    `${process.env.NEXT_PUBLIC_PLACE_API_URL}` +
    `city=` +
    `${placeQuery}` +
    `&format=json`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch place data');
    }

    const places: any = await res.json();
    return places;
  } catch (error) {
    console.error('Error fetching place data:', error);
    throw error;
  }
}

// Get place by using free type string search
export async function getPlaceFree(placeQuery: string): Promise<Place[]> {
  const url = `${process.env.NEXT_PUBLIC_PLACE_API_URL}q=${encodeURIComponent(placeQuery)}&format=json`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch place data: ${res.status}`);
    }

    const places = (await res.json()) as Place[];
    return places;
  } catch (error) {
    console.error('Error fetching place data:', error);
    throw error;
  }
}
