import { createApp } from "./app";
import { env, validateEnv } from "./config/env";

export function startServer(): void {
  validateEnv();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(
      `AtmosAI Weather webhook listening on http://localhost:${env.port}`
    );
    console.log(`Dialogflow fulfillment URL: POST /webhook/dialogflow`);
  });
}

if (require.main === module) {
  startServer();
}
