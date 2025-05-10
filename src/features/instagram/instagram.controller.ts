import { Request, RequestHandler, Response } from "express";
import { logger } from "../../common/logger";
import { supabase } from "../../common/supabase";
import { InstagramService } from "./instagram.service";

const instagramService = new InstagramService();

export class InstagramController {
  getAuthUrl: RequestHandler = async (req: Request, res: Response) => {
    try {
      logger.info("Generating Instagram auth URL for user: %s", req.user.email);
      const authUrl = instagramService.getAuthUrl();
      logger.debug("Generated auth URL: %s", authUrl);
      res.json({ authUrl });
    } catch (error) {
      logger.error(
        "Error generating auth URL for user %s: %O",
        req.user.email,
        error
      );
      res.status(500).json({ error: "Failed to generate authentication URL" });
    }
  };

  handleCallback: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      logger.info("Processing Instagram callback for user: %s", req.user.email);
      const { code } = req.query;
      const userId = req.user.db_id;

      logger.info("Processing Instagram callback for user: %s", req.user.email);

      if (!code || !userId) {
        logger.warn(
          "Missing required parameters in Instagram callback. Code: %s, UserId: %s",
          code,
          userId
        );
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Exchange code for access token
      logger.debug("Exchanging code for access token");
      const tokenData = await instagramService.exchangeCodeForToken(
        code as string
      );
      logger.debug("Successfully obtained access token");

      // Get Instagram user profile
      logger.debug("Fetching Instagram user profile");
      const instagramProfile = await instagramService.getInstagramUserProfile(
        tokenData.user_id,
        tokenData.access_token
      );
      logger.info("Found Instagram profile for user %s", req.user.email);

      // Get long-lived token
      logger.debug("Exchanging short-lived token for long-lived token");
      const longLivedToken = await instagramService.getLongLivedToken(
        tokenData.access_token
      );
      logger.debug("Successfully obtained long-lived token");

      // Create channel in database
      const { data: channel, error } = await supabase
        .from("channels")
        .insert({
          user_id: userId,
          platform: "instagram",
          name: instagramProfile.username,
          access_token: longLivedToken.access_token,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating channel for Instagram profile: %O", error);
        return res
          .status(500)
          .json({ error: "Failed to create Instagram channel" });
      }

      logger.info("Successfully created channel for Instagram profile");

      res.json({
        success: true,
        channel: channel,
      });
    } catch (error) {
      logger.error(
        "Error handling Instagram callback for user %s: %O",
        req.user.email,
        error
      );
      res.status(500).json({ error: "Failed to process Instagram callback" });
    }
  };
}
