import app from "./app";
import { env } from "./config/env";

export function startServer(): void {
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
