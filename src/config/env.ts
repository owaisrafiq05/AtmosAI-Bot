import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY ?? "",
  openWeatherBaseUrl:
    process.env.OPENWEATHER_BASE_URL ?? "https://api.openweathermap.org",
  forecastDays: Number(process.env.FORECAST_DAYS ?? 8),
  units: (process.env.WEATHER_UNITS ?? "metric") as "metric" | "imperial",
};

export function validateEnv(): void {
  requireEnv("OPENWEATHER_API_KEY");
}
