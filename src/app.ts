import express from "express";
import { createRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(): express.Application {
  const app = express();

  app.use(express.json());
  app.use(createRoutes());
  app.use(errorHandler);

  return app;
}
