# AtmosAI Weather Bot — Dialogflow ES Webhook

REST API fulfillment backend for the **Weather Info & Forecast Bot** evaluation task. Receives Dialogflow ES webhook requests, reads city and date from session/parameters, fetches weather from [OpenWeatherMap](https://openweathermap.org/api), and returns fulfillment text to the chat UI.

## Project structure

```
src/
  server.ts                     # Entry point — starts HTTP server
  app.ts                        # Express app factory
  config/env.ts                 # Environment configuration
  controllers/webhook.controller.ts
  middleware/errorHandler.ts
  routes/                       # Route definitions
  services/
    openweather.client.ts       # OpenWeatherMap HTTP client
    weather.service.ts          # Business logic & formatting
  types/                        # Dialogflow & weather types
  utils/                        # Date & Dialogflow helpers
```

## Prerequisites

- Node.js 18+
- [OpenWeatherMap](https://openweathermap.org/api) API key
- [Dialogflow ES](https://dialogflow.cloud.google.com/) agent with fulfillment enabled
- [Vercel](https://vercel.com/) account for production deployment (or [ngrok](https://ngrok.com/) for local testing)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and add your API key:

```bash
cp .env.example .env
```

3. Start the dev server:

```bash
npm run dev
```

4. Deploy to Vercel (recommended for Dialogflow webhook URL):

```bash
npm i -g vercel   # optional, if CLI not installed
vercel            # first deploy — link project, set env vars when prompted
vercel --prod     # production URL
```

In the [Vercel dashboard](https://vercel.com/) → Project → **Settings** → **Environment Variables**, add:

| Variable | Required |
|----------|----------|
| `OPENWEATHER_API_KEY` | Yes |
| `FORECAST_DAYS` | No (default `8`) |
| `WEATHER_UNITS` | No (default `metric`) |

5. In Dialogflow ES → **Fulfillment** → enable webhook and set URL to:

```
https://<your-vercel-domain>/webhook/dialogflow
```

Example: `https://atmosai-bot.vercel.app/webhook/dialogflow`

**Local testing with ngrok** (optional):

```bash
npm run dev
ngrok http 3000
# Use https://<ngrok-host>/webhook/dialogflow in Dialogflow
```

## Dialogflow configuration (recommended)

Create intents that collect **city** and optional **date** entities.

| Parameter (Dialogflow) | Aliases handled in code      |
|------------------------|------------------------------|
| `@sys.geo-city` or custom `city` | `geo-city`, `city`, `location` |
| `@sys.date` or `@sys.date-time`  | `date`, `date-time`, `date-period` |

**Intent examples**

- **Current weather** — e.g. “What’s the weather in London?”  
  - Enable webhook fulfillment on the intent.  
  - No date → returns **current** weather using session date.

- **Forecast** — e.g. “Forecast for Paris for the next week”  
  - Intent name containing `forecast`, or a future date parameter → returns up to **8 days** forecast from start date.

**Session time**  
If Dialogflow sends `originalDetectIntentRequest.payload.time`, that value is used as the session date; otherwise the server uses the current UTC date.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/webhook/health` | Health check |
| POST | `/webhook/dialogflow` | Dialogflow fulfillment webhook |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run typecheck` | Type-check without emit |

## Deploy on Vercel

The repo includes `vercel.json` and `api/index.ts`. All routes are rewritten to a single Express serverless function.

| File | Role |
|------|------|
| `vercel.json` | Build, rewrites, function limits |
| `api/index.ts` | Serverless entry — exports the compiled Express app |

After deploy, verify:

- `GET https://<domain>/webhook/health`
- `POST https://<domain>/webhook/dialogflow` (Dialogflow fulfillment)

## Production build (Node server)

```bash
npm run build
npm start
```

## License

ISC
