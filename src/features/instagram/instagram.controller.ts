import { Request, RequestHandler, Response } from "express";
import { logger } from "../../common/logger";
import { ChannelsDao } from "../channels/channels.dao";
import { InstagramService } from "./instagram.service";

const instagramService = new InstagramService();

export class InstagramController {
  getAuthUrl: RequestHandler = async (req: Request, res: Response) => {
    try {
      logger.info(
        "instagram.controller.ts: getAuthUrl: Generating Instagram auth URL",
        { userEmail: req.user.email }
      );
      const authUrl = instagramService.getAuthUrl();
      logger.debug("instagram.controller.ts: getAuthUrl: Generated auth URL", {
        authUrl,
      });
      res.json({ authUrl });
    } catch (error) {
      logger.error(
        "instagram.controller.ts: getAuthUrl: Error generating auth URL",
        { userEmail: req.user.email, error }
      );
      res.status(500).json({ error: "Failed to generate authentication URL" });
    }
  };

  handleCallback: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      logger.info(
        "instagram.controller.ts: handleCallback: Processing Instagram callback",
        { userEmail: req.user.email }
      );
      const { code } = req.query;
      const userId = req.user.db_id;

      if (!code || !userId) {
        logger.warn(
          "instagram.controller.ts: handleCallback: Missing required parameters",
          { code, userId }
        );
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Exchange code for access token
      logger.debug(
        "instagram.controller.ts: handleCallback: Exchanging code for access token"
      );
      const tokenData = await instagramService.exchangeCodeForToken(
        code as string
      );
      logger.debug(
        "instagram.controller.ts: handleCallback: Successfully obtained access token"
      );

      // Get Instagram user profile
      logger.debug(
        "instagram.controller.ts: handleCallback: Fetching Instagram user profile"
      );
      const instagramProfile = await instagramService.getInstagramUserProfile(
        tokenData.user_id,
        tokenData.access_token
      );
      logger.info(
        "instagram.controller.ts: handleCallback: Found Instagram profile",
        { userEmail: req.user.email }
      );

      // Get long-lived token
      logger.debug(
        "instagram.controller.ts: handleCallback: Exchanging short-lived token for long-lived token"
      );
      const longLivedToken = await instagramService.getLongLivedToken(
        tokenData.access_token
      );
      logger.debug(
        "instagram.controller.ts: handleCallback: Successfully obtained long-lived token"
      );

      // Create channel in database
      const { data: channel, error } = await ChannelsDao.createChannel({
        user_id: userId,
        platform: "instagram",
        name: instagramProfile.username,
        profile_url: instagramProfile.profile_picture_url,
        connection_state: true,
        access_token: longLivedToken.access_token,
      });

      if (error) {
        logger.error(
          "instagram.controller.ts: handleCallback: Error creating channel",
          { error }
        );
        return res
          .status(500)
          .json({ error: "Failed to create Instagram channel" });
      }

      logger.info(
        "instagram.controller.ts: handleCallback: Successfully created channel for Instagram profile"
      );

      res.json({
        success: true,
        channel: channel,
      });
    } catch (error) {
      logger.error(
        "instagram.controller.ts: handleCallback: Error handling Instagram callback",
        { userEmail: req.user.email, error }
      );
      res.status(500).json({ error: "Failed to process Instagram callback" });
    }
  };
}
