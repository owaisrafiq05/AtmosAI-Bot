import { env } from "../config/env";
import type {
  CurrentWeatherResult,
  DailyForecastEntry,
  ForecastWeatherResult,
} from "../types/weather";
import {
  addDays,
  formatDisplayDate,
  toDateKey,
} from "../utils/date";
import { OpenWeatherClient } from "./openweather.client";

export class WeatherService {
  private readonly client: OpenWeatherClient;

  constructor(client?: OpenWeatherClient) {
    this.client =
      client ??
      new OpenWeatherClient(env.openWeatherApiKey, env.openWeatherBaseUrl);
  }

  async getCurrentWeather(
    city: string,
    sessionDate: Date
  ): Promise<CurrentWeatherResult> {
    const data = await this.client.getCurrentWeather(city);
    return {
      city: data.city,
      country: data.country,
      date: toDateKey(sessionDate),
      description: data.description,
      tempC: data.tempC,
      feelsLikeC: data.feelsLikeC,
      humidity: data.humidity,
      windSpeedMs: data.windSpeedMs,
    };
  }

  async getForecast(
    city: string,
    startDate: Date,
    dayCount: number = env.forecastDays
  ): Promise<ForecastWeatherResult> {
    const startKey = toDateKey(startDate);
    const endDate = addDays(startDate, dayCount - 1);
    const endKey = toDateKey(endDate);

    const location = await this.client.geocodeCity(city);
    const dailyOneCall = await this.client.getDailyForecast(
      { lat: location.lat, lon: location.lon },
      dayCount
    );

    let days: DailyForecastEntry[] = [];

    if (dailyOneCall.length > 0) {
      days = dailyOneCall
        .map((day) => {
          const dateKey = new Date(day.dt * 1000).toISOString().slice(0, 10);
          return {
            date: dateKey,
            description: day.weather[0]?.description ?? "N/A",
            tempMinC: Math.round(day.temp.min * 10) / 10,
            tempMaxC: Math.round(day.temp.max * 10) / 10,
            humidity: day.humidity,
          };
        })
        .filter((d) => d.date >= startKey && d.date <= endKey);
    } else {
      const forecast = await this.client.getForecastByCity(city);
      const aggregated = this.client.aggregateForecastList(
        forecast.list,
        startKey,
        endKey
      );

      days = [...aggregated.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, bucket]) => ({
          date: dateKey,
          description: bucket.descriptions[0] ?? "N/A",
          tempMinC: Math.round(Math.min(...bucket.mins) * 10) / 10,
          tempMaxC: Math.round(Math.max(...bucket.maxs) * 10) / 10,
          humidity: Math.round(
            bucket.humidity.reduce((a, b) => a + b, 0) / bucket.humidity.length
          ),
        }));
    }

    return {
      city: location.city,
      country: location.country,
      startDate: startKey,
      endDate: endKey,
      days,
    };
  }

  formatCurrentWeather(result: CurrentWeatherResult): string {
    const dateLabel = formatDisplayDate(result.date);
    return [
      `Current weather in ${result.city}, ${result.country} (${dateLabel}):`,
      `• Conditions: ${result.description}`,
      `• Temperature: ${result.tempC}°C (feels like ${result.feelsLikeC}°C)`,
      `• Humidity: ${result.humidity}%`,
      `• Wind: ${result.windSpeedMs} m/s`,
    ].join("\n");
  }

  formatForecast(result: ForecastWeatherResult): string {
    if (!result.days.length) {
      return `No forecast data available for ${result.city} between ${formatDisplayDate(result.startDate)} and ${formatDisplayDate(result.endDate)}.`;
    }

    const lines = result.days.map(
      (day) =>
        `• ${formatDisplayDate(day.date)}: ${day.description}, ${day.tempMinC}°C – ${day.tempMaxC}°C, humidity ${day.humidity}%`
    );

    return [
      `Weather forecast for ${result.city}, ${result.country}`,
      `From ${formatDisplayDate(result.startDate)} to ${formatDisplayDate(result.endDate)}:`,
      ...lines,
    ].join("\n");
  }
}
