import express from "express";
import { validateEnv } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { createRoutes } from "./routes";

function buildApp(): express.Application {
  const app = express();

  app.use(express.json());
  app.use(createRoutes());
  app.use(errorHandler);

  return app;
}

validateEnv();

/** Vercel Express entry (see https://vercel.com/docs/frameworks/backend/express) */
const app = buildApp();
export = app;
