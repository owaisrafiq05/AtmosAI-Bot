import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../src/app";
import { validateEnv } from "../src/config/env";

let app: ReturnType<typeof createApp> | undefined;

function getApp(): ReturnType<typeof createApp> {
  if (!app) {
    validateEnv();
    app = createApp();
  }
  return app;
}

export default function handler(
  req: IncomingMessage,
  res: ServerResponse
): void {
  getApp()(req, res);
}
