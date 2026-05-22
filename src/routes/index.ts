import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller";
import { createWebhookRoutes } from "./webhook.routes";

export function createRoutes(): Router {
  const router = Router();
  const webhookController = new WebhookController();

  router.use("/webhook", createWebhookRoutes(webhookController));

  router.get("/", (_req, res) => {
    res.json({
      name: "AtmosAI Weather Webhook",
      endpoints: {
        health: "GET /webhook/health",
        dialogflow: "POST /webhook/dialogflow",
      },
    });
  });

  return router;
}
