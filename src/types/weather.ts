export interface Coordinates {
  lat: number;
  lon: number;
}

export interface CurrentWeatherResult {
  city: string;
  country: string;
  date: string;
  description: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedMs: number;
}

export interface DailyForecastEntry {
  date: string;
  description: string;
  tempMinC: number;
  tempMaxC: number;
  humidity: number;
}

export interface ForecastWeatherResult {
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  days: DailyForecastEntry[];
}
