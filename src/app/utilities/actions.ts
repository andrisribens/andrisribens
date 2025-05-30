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

export async function getWeather(lat:number, long:number): Promise<WeatherData> {
  const url: string = `${process.env.NEXT_PUBLIC_WEATHER_API_URL}` + `?lat=` + `${lat}` + `&lon=` + `${long}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch weather data'); 
    }

    const weather: any = await res.json();
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

  const url: string = `${process.env.NEXT_PUBLIC_PLACE_API_URL}` + `city=` + `${placeQuery}` + `&format=json`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch place data')
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

  const url: string = `${process.env.NEXT_PUBLIC_PLACE_API_URL}` + `q=` + `${placeQuery}` + `&format=json`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'andrisribens.com (andris.ribens@gmail.com)',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch place data')
    }

    const places: any = await res.json();
    return places;
  } catch (error) {
    console.error('Error fetching place data:', error);
    throw error;
  }
}




