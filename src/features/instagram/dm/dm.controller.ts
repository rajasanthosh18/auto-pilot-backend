import { Request, RequestHandler, Response } from "express";
import { logger } from "../../../common/logger";
import { ChannelsDao } from "../../channels/channels.dao";
import { InstagramDMService } from "./dm.service";

const instagramDMService = new InstagramDMService();

export class InstagramDMController {
  /**
   * Send a templated message with buttons to an Instagram user
   */
  sendTemplatedMessage: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      logger.info("instagram.dm.controller: Sending templated message", {
        userEmail: req.user.email,
      });

      const userId = req.user.db_id;
      const channelId = req.params.channelId;
      const { recipientId, text, buttons } = req.body;

      if (!recipientId || !text || !buttons) {
        logger.warn("instagram.dm.controller: Missing required parameters", {
          recipientId,
          text,
          buttons,
        });
        res.status(400).json({ error: "Missing required parameters" });
        return;
      }

      // Get the specific channel and verify it belongs to the user
      const { data: channel, error } = await ChannelsDao.getChannelById(
        channelId
      );

      if (error) {
        logger.error("instagram.dm.controller: Error retrieving channel", {
          userEmail: req.user.email,
          channelId,
          error,
        });
        res.status(500).json({ error: "Failed to retrieve channel" });
        return;
      }

      if (!channel) {
        logger.warn("instagram.dm.controller: Channel not found", {
          userEmail: req.user.email,
          channelId,
        });
        res.status(404).json({ error: "Channel not found" });
        return;
      }

      // Verify the channel belongs to the user
      if (channel.user_id !== userId) {
        logger.warn("instagram.dm.controller: Unauthorized access to channel", {
          userEmail: req.user.email,
          channelId,
        });
        res
          .status(403)
          .json({ error: "You don't have access to this channel" });
        return;
      }

      // Verify the channel is an Instagram channel
      if (channel.platform !== "instagram") {
        logger.warn("instagram.dm.controller: Not an Instagram channel", {
          userEmail: req.user.email,
          channelId,
        });
        res.status(400).json({ error: "Channel is not an Instagram channel" });
        return;
      }

      // Verify the channel is connected (has an access token)
      if (!channel.access_token || !channel.connection_state) {
        logger.warn("instagram.dm.controller: Channel not connected", {
          userEmail: req.user.email,
          channelId,
        });
        res.status(400).json({ error: "Instagram channel is not connected" });
        return;
      }

      // Send the templated message
      const response = await instagramDMService.sendTemplatedMessage(
        channel.access_token,
        recipientId,
        text,
        buttons
      );

      logger.info(
        "instagram.dm.controller: Successfully sent templated message",
        {
          userEmail: req.user.email,
          channelId,
          recipientId,
          messageId: response.message_id,
        }
      );

      res.json(response);
    } catch (error) {
      logger.error("instagram.dm.controller: Error sending templated message", {
        userEmail: req.user.email,
        error,
      });
      res.status(500).json({ error: "Failed to send templated message" });
    }
  };
}
