import { env } from "../config/env";
import type { Coordinates } from "../types/weather";

interface GeocodeResponse {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface CurrentWeatherApiResponse {
  name: string;
  sys: { country: string };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{ description: string }>;
  wind: { speed: number };
}

interface ForecastListItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{ description: string }>;
}

interface ForecastApiResponse {
  city: { name: string; country: string };
  list: ForecastListItem[];
}

interface OneCallDaily {
  dt: number;
  temp: { min: number; max: number };
  humidity: number;
  weather: Array<{ description: string }>;
}

interface OneCallApiResponse {
  daily?: OneCallDaily[];
}

export class OpenWeatherClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `OpenWeather API error (${response.status}): ${body || response.statusText}`
      );
    }
    return response.json() as Promise<T>;
  }

  async geocodeCity(city: string): Promise<Coordinates & { city: string; country: string }> {
    const params = new URLSearchParams({
      q: city,
      limit: "1",
      appid: this.apiKey,
    });
    const url = `${this.baseUrl}/geo/1.0/direct?${params}`;
    const results = await this.fetchJson<GeocodeResponse[]>(url);

    if (!results.length) {
      throw new Error(`City not found: ${city}`);
    }

    const [match] = results;
    return {
      city: match.name,
      country: match.country,
      lat: match.lat,
      lon: match.lon,
    };
  }

  async getCurrentWeather(city: string): Promise<{
    city: string;
    country: string;
    description: string;
    tempC: number;
    feelsLikeC: number;
    humidity: number;
    windSpeedMs: number;
  }> {
    const params = new URLSearchParams({
      q: city,
      appid: this.apiKey,
      units: env.units,
    });
    const url = `${this.baseUrl}/data/2.5/weather?${params}`;
    const data = await this.fetchJson<CurrentWeatherApiResponse>(url);

    return {
      city: data.name,
      country: data.sys.country,
      description: data.weather[0]?.description ?? "N/A",
      tempC: Math.round(data.main.temp * 10) / 10,
      feelsLikeC: Math.round(data.main.feels_like * 10) / 10,
      humidity: data.main.humidity,
      windSpeedMs: data.wind.speed,
    };
  }

  async getForecastByCity(city: string): Promise<ForecastApiResponse> {
    const params = new URLSearchParams({
      q: city,
      appid: this.apiKey,
      units: env.units,
    });
    const url = `${this.baseUrl}/data/2.5/forecast?${params}`;
    return this.fetchJson<ForecastApiResponse>(url);
  }

  async getDailyForecast(
    coords: Coordinates,
    days: number
  ): Promise<OneCallDaily[]> {
    const params = new URLSearchParams({
      lat: String(coords.lat),
      lon: String(coords.lon),
      exclude: "current,minutely,hourly,alerts",
      appid: this.apiKey,
      units: env.units,
    });

    try {
      const url = `${this.baseUrl}/data/3.0/onecall?${params}`;
      const data = await this.fetchJson<OneCallApiResponse>(url);
      if (data.daily?.length) {
        return data.daily.slice(0, days);
      }
    } catch {
      // Fall back to 5-day / 3-hour forecast on free tier
    }

    return [];
  }

  aggregateForecastList(
    list: ForecastListItem[],
    startDateKey: string,
    endDateKey: string
  ): Map<string, { temps: number[]; mins: number[]; maxs: number[]; humidity: number[]; descriptions: string[] }> {
    const byDay = new Map<
      string,
      {
        temps: number[];
        mins: number[];
        maxs: number[];
        humidity: number[];
        descriptions: string[];
      }
    >();

    for (const item of list) {
      const dateKey = new Date(item.dt * 1000).toISOString().slice(0, 10);
      if (dateKey < startDateKey || dateKey > endDateKey) {
        continue;
      }

      let bucket = byDay.get(dateKey);
      if (!bucket) {
        bucket = { temps: [], mins: [], maxs: [], humidity: [], descriptions: [] };
        byDay.set(dateKey, bucket);
      }

      bucket.temps.push(item.main.temp);
      bucket.mins.push(item.main.temp_min);
      bucket.maxs.push(item.main.temp_max);
      bucket.humidity.push(item.main.humidity);
      if (item.weather[0]?.description) {
        bucket.descriptions.push(item.weather[0].description);
      }
    }

    return byDay;
  }
}
