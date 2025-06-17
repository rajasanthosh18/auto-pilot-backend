import { Request, Response } from "express";
import { logger } from "../../../common/logger";
import { WebhookService } from "./webhook.service";

export class WebhookController {
  private webhookService: WebhookService;

  constructor() {
    this.webhookService = new WebhookService();
  }

  /**
   * Handle webhook verification request from Instagram
   */
  public verifyWebhook = async (req: Request, res: Response): Promise<void> => {
    const requestId = Math.random().toString(36).substring(7);
    logger.info("Webhook verification request received", {
      requestId,
      query: req.query,
      headers: req.headers,
    });

    try {
      const mode = req.query["hub.mode"] as string;
      const token = req.query["hub.verify_token"] as string;
      const challenge = req.query["hub.challenge"] as string;

      logger.debug("Webhook verification parameters", {
        requestId,
        mode,
        token: token ? "***" : undefined, // Mask token for security
        challenge,
      });

      const verificationResult = await this.webhookService.verifyWebhook(
        mode,
        token,
        challenge
      );

      if (verificationResult.success) {
        logger.info("Webhook verification successful", {
          requestId,
          challenge,
        });
        res.status(200).send(verificationResult.data);
      } else {
        logger.warn("Webhook verification failed", {
          requestId,
          reason: verificationResult.message,
        });
        res.status(403).send(verificationResult.message);
      }
    } catch (error) {
      logger.error("Error during webhook verification", {
        requestId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({
        success: false,
        message: "Error verifying webhook",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Handle incoming webhook messages from Instagram
   */
  public handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const requestId = Math.random().toString(36).substring(7);
    logger.info("Webhook message received", {
      requestId,
      body: req.body,
      headers: req.headers,
    });

    try {
      const body = req.body;

      if (body.object !== "instagram") {
        logger.warn("Invalid webhook object type", {
          requestId,
          object: body.object,
        });
        res.status(404).send("Not found");
        return;
      }

      const result = await this.webhookService.processWebhookMessage(body);

      if (result.success) {
        logger.info("Webhook message processed successfully", {
          requestId,
        });
        res.status(200).send("EVENT_RECEIVED");
      } else {
        logger.error("Error processing webhook message", {
          requestId,
          error: result.message,
        });
        res.status(500).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error("Unexpected error processing webhook", {
        requestId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({
        success: false,
        message: "Error processing webhook",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
