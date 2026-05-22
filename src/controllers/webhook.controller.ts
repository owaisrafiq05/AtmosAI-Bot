import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { WeatherService } from "../services/weather.service";
import type { DialogflowWebhookRequest } from "../types/dialogflow";
import { toDateKey } from "../utils/date";
import {
  buildWebhookResponse,
  extractCity,
  extractRequestedDate,
  getSessionDate,
  shouldReturnForecast,
} from "../utils/dialogflow";

export class WebhookController {
  constructor(private readonly weatherService = new WeatherService()) {}

  health = (_req: Request, res: Response): void => {
    res.json({ status: "ok", service: "atmosai-weather-webhook" });
  };

  dialogflow = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = req.body as DialogflowWebhookRequest;
      const queryResult = body.queryResult;

      if (!queryResult) {
        res.json(
          buildWebhookResponse(
            "I could not process your request. Please try again."
          )
        );
        return;
      }

      const parameters = queryResult.parameters ?? {};
      const city = extractCity(parameters);

      if (!city) {
        res.json(
          buildWebhookResponse(
            "Which city would you like weather information for?"
          )
        );
        return;
      }

      const sessionDate = getSessionDate(body);
      const requestedDate = extractRequestedDate(parameters, sessionDate);
      const intentName = queryResult.intent?.displayName;

      const useForecast = shouldReturnForecast(
        intentName,
        requestedDate,
        sessionDate
      );

      if (useForecast) {
        const startDate = requestedDate ?? sessionDate;
        const forecast = await this.weatherService.getForecast(
          city,
          startDate,
          env.forecastDays
        );
        res.json(
          buildWebhookResponse(this.weatherService.formatForecast(forecast))
        );
        return;
      }

      const current = await this.weatherService.getCurrentWeather(
        city,
        sessionDate
      );

      if (
        requestedDate &&
        toDateKey(requestedDate) !== toDateKey(sessionDate)
      ) {
        const forecast = await this.weatherService.getForecast(
          city,
          requestedDate,
          1
        );
        const day = forecast.days.find(
          (d) => d.date === toDateKey(requestedDate)
        );
        if (day) {
          res.json(
            buildWebhookResponse(
              [
                `Forecast for ${forecast.city} on ${day.date}:`,
                `• ${day.description}`,
                `• ${day.tempMinC}°C – ${day.tempMaxC}°C`,
                `• Humidity: ${day.humidity}%`,
              ].join("\n")
            )
          );
          return;
        }
      }

      res.json(
        buildWebhookResponse(this.weatherService.formatCurrentWeather(current))
      );
    } catch (error) {
      next(error);
    }
  };
}
