import axios from "axios";
import { logger } from "../../../common/logger";

interface ButtonTemplate {
  type: "web_url" | "postback";
  title: string;
  url?: string;
  payload?: string;
}

interface MessageTemplate {
  template_type: "button";
  text: string;
  buttons: ButtonTemplate[];
}

interface SendMessageResponse {
  recipient_id: string;
  message_id: string;
}

export class InstagramDMService {
  private readonly apiVersion: string = "v19.0";

  /**
   * Send a templated message with buttons to an Instagram user
   * @param accessToken Instagram access token
   * @param recipientId Instagram user ID of the recipient
   * @param text Message text to display above buttons
   * @param buttons Array of buttons (up to 3)
   * @returns Response containing recipient_id and message_id
   */
  async sendTemplatedMessage(
    accessToken: string,
    recipientId: string,
    text: string,
    buttons: ButtonTemplate[]
  ): Promise<SendMessageResponse> {
    try {
      logger.info("instagram.dm.service: Sending templated message", {
        recipientId,
        text,
        buttonCount: buttons.length,
      });

      if (buttons.length > 3) {
        throw new Error("Maximum of 3 buttons allowed in a template message");
      }

      if (text.length > 640) {
        throw new Error("Message text cannot exceed 640 characters");
      }

      const template: MessageTemplate = {
        template_type: "button",
        text,
        buttons,
      };

      const response = await axios.post<SendMessageResponse>(
        `https://graph.instagram.com/${this.apiVersion}/me/messages`,
        {
          recipient: {
            id: recipientId,
          },
          message: {
            attachment: {
              type: "template",
              payload: template,
            },
          },
        },
        {
          params: {
            access_token: accessToken,
          },
        }
      );

      logger.info("instagram.dm.service: Successfully sent templated message", {
        recipientId,
        messageId: response.data.message_id,
      });

      return response.data;
    } catch (error: any) {
      logger.error("instagram.dm.service: Error sending templated message", {
        error,
        recipientId,
      });

      if (error.response?.data?.error) {
        throw new Error(
          `Instagram API Error: ${error.response.data.error.message}`
        );
      }

      throw error;
    }
  }
}
