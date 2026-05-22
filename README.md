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
- [ngrok](https://ngrok.com/) (or similar) to expose localhost to Dialogflow

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

4. Expose with ngrok:

```bash
ngrok http 3000
```

5. In Dialogflow ES → **Fulfillment** → enable webhook and set URL to:

```
https://<your-ngrok-host>/webhook/dialogflow
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

## Production build

```bash
npm run build
npm start
```

## License

ISC
