import { Router } from "express";
import { IRouter } from "../../../types/router";
import { WebhookController } from "./webhook.controller";

const router = Router();
const webhookController = new WebhookController();

// Webhook verification endpoint
router.get("/verify", webhookController.verifyWebhook);

// Webhook callback endpoint for receiving messages
router.post("/callback", webhookController.handleWebhook);

export default {
  path: "/public/webhook/instagram",
  router,
} as IRouter;
