import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller";

export function createWebhookRoutes(controller: WebhookController): Router {
  const router = Router();

  router.get("/health", controller.health);
  router.post("/dialogflow", controller.dialogflow);

  return router;
}
