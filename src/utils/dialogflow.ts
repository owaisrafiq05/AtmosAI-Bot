import type {
  DialogflowWebhookRequest,
  DialogflowWebhookResponse,
} from "../types/dialogflow";
import { parseDialogflowDate, startOfDay, toDateKey } from "./date";

const CITY_PARAM_KEYS = ["geo-city", "city", "location", "any"];
const DATE_PARAM_KEYS = ["date", "date-time", "date-period", "date_time"];

export function extractCity(parameters: Record<string, unknown>): string | null {
  for (const key of CITY_PARAM_KEYS) {
    const value = parameters[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export function extractRequestedDate(
  parameters: Record<string, unknown>,
  sessionDate: Date
): Date | null {
  for (const key of DATE_PARAM_KEYS) {
    if (key in parameters) {
      return parseDialogflowDate(parameters[key], sessionDate);
    }
  }
  return null;
}

export function getSessionDate(
  body: DialogflowWebhookRequest
): Date {
  const payload = body.originalDetectIntentRequest?.payload;
  if (payload && typeof payload === "object") {
    const time =
      (payload as { time?: string }).time ??
      (payload as { timestamp?: string }).timestamp;
    if (time) {
      const parsed = new Date(time);
      if (!Number.isNaN(parsed.getTime())) {
        return startOfDay(parsed);
      }
    }
  }
  return startOfDay(new Date());
}

export function isForecastIntent(intentName?: string): boolean {
  if (!intentName) return false;
  const normalized = intentName.toLowerCase();
  return (
    normalized.includes("forecast") ||
    normalized.includes("future") ||
    normalized.includes("upcoming")
  );
}

export function shouldReturnForecast(
  intentDisplayName: string | undefined,
  requestedDate: Date | null,
  sessionDate: Date
): boolean {
  if (isForecastIntent(intentDisplayName)) {
    return true;
  }
  if (!requestedDate) {
    return false;
  }
  return toDateKey(requestedDate) !== toDateKey(sessionDate);
}

export function buildWebhookResponse(text: string): DialogflowWebhookResponse {
  return {
    fulfillmentText: text,
    fulfillmentMessages: [
      {
        text: {
          text: [text],
        },
      },
    ],
  };
}
