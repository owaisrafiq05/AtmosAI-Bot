import type { Request, Response, NextFunction } from "express";
import { buildWebhookResponse } from "../utils/dialogflow";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred.";

  console.error("[webhook error]", message);

  const isDialogflow = _req.path.includes("dialogflow");

  if (isDialogflow) {
    res.status(200).json(
      buildWebhookResponse(
        `Sorry, I could not fetch weather data right now. ${message}`
      )
    );
    return;
  }

  res.status(500).json({ error: message });
}
