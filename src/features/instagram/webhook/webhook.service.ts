import { logger } from "../../../common/logger";
import { config } from "../../../config";

interface WebhookVerificationResult {
  success: boolean;
  data?: string;
  message?: string;
}

interface WebhookMessageResult {
  success: boolean;
  message?: string;
}

export class WebhookService {
  private readonly verifyToken: string;

  constructor() {
    this.verifyToken = config.instagram.webhookVerifyToken;
    logger.info("WebhookService initialized", {
      hasVerifyToken: !!this.verifyToken,
    });
  }

  /**
   * Verify the webhook request from Instagram
   */
  public async verifyWebhook(
    mode: string,
    token: string,
    challenge: string
  ): Promise<WebhookVerificationResult> {
    logger.debug("Verifying webhook", {
      mode,
      hasToken: !!token,
      hasChallenge: !!challenge,
    });

    try {
      if (mode === "subscribe" && token === this.verifyToken) {
        logger.info("Webhook verification successful", {
          mode,
          challenge,
        });
        return {
          success: true,
          data: challenge,
        };
      }

      logger.warn("Webhook verification failed", {
        mode,
        tokenMatch: token === this.verifyToken,
      });

      return {
        success: false,
        message: "Verification failed",
      };
    } catch (error) {
      logger.error("Error during webhook verification", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error during verification",
      };
    }
  }

  /**
   * Process incoming webhook messages from Instagram
   */
  public async processWebhookMessage(body: any): Promise<WebhookMessageResult> {
    logger.debug("Processing webhook message", {
      object: body.object,
      entryCount: body.entry?.length,
    });

    try {
      const entry = body.entry;

      for (const output of entry) {
        const outputMessage = output.messaging[0];
        const senderId = outputMessage.sender.id;
        const recipientId = outputMessage.recipient.id;
        const messageText = outputMessage.message.text;

        logger.info("Processing Instagram message", {
          senderId,
          recipientId,
          messageLength: messageText?.length,
          timestamp: new Date().toISOString(),
        });

        // TODO: Implement your message handling logic here
        // For now, we'll just log the message
        logger.debug("Message details", {
          senderId,
          recipientId,
          messageText,
        });
      }

      logger.info("Successfully processed webhook message", {
        entryCount: entry.length,
      });

      return {
        success: true,
      };
    } catch (error) {
      logger.error("Error processing webhook message", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        body: JSON.stringify(body),
      });
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error processing message",
      };
    }
  }
}
