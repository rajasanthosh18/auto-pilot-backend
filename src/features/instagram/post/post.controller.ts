import { Request, RequestHandler, Response } from "express";
import { logger } from "../../../common/logger";
import { ChannelsDao } from "../../channels/channels.dao";
import { InstagramPostService } from "./post.service";

const instagramPostService = new InstagramPostService();

export class InstagramPostController {
  /**
   * Get paginated Instagram posts with comments enabled
   */
  getPaginatedPosts: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      logger.info(
        "instagram.post.controller: Getting paginated Instagram posts",
        { userEmail: req.user.email }
      );

      const userId = req.user.db_id;
      const { limit = 25, after, before } = req.query;

      // Get the user's Instagram channel to retrieve the access token
      const { data: channels, error } = await ChannelsDao.getUserChannels(
        userId
      );

      if (error) {
        logger.error("instagram.post.controller: Error retrieving channels", {
          userEmail: req.user.email,
          error,
        });
        res.status(500).json({ error: "Failed to retrieve channels" });
        return;
      }

      const instagramChannel = channels?.find(
        (channel) => channel.platform === "instagram"
      );

      if (!instagramChannel) {
        logger.warn(
          "instagram.post.controller: No Instagram channel found for user",
          { userEmail: req.user.email }
        );
        res.status(404).json({ error: "Instagram channel not found" });
        return;
      }

      if (!instagramChannel.access_token) {
        logger.warn(
          "instagram.post.controller: Instagram channel has no access token",
          { userEmail: req.user.email }
        );
        res.status(400).json({ error: "Instagram authentication required" });
        return;
      }

      // Get paginated posts from Instagram
      const posts = await instagramPostService.getPaginatedPosts(
        instagramChannel.access_token,
        Number(limit),
        after as string | undefined,
        before as string | undefined
      );

      logger.info(
        "instagram.post.controller: Successfully retrieved Instagram posts",
        { userEmail: req.user.email, count: posts.data.length }
      );

      res.json(posts);
    } catch (error) {
      logger.error(
        "instagram.post.controller: Error retrieving Instagram posts",
        { userEmail: req.user.email, error }
      );
      res.status(500).json({ error: "Failed to retrieve Instagram posts" });
    }
  };

  /**
   * Get paginated Instagram posts for a specific channel
   */
  getPostsByChannelId: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user.db_id;
      const channelId = req.params.channelId;
      const { limit = 25, after, before } = req.query;

      logger.info(
        "instagram.post.controller: Getting posts for specific channel",
        { userEmail: req.user.email, channelId }
      );

      // Get the specific channel and verify it belongs to the user
      const { data: channel, error } = await ChannelsDao.getChannelById(
        channelId
      );

      if (error) {
        logger.error("instagram.post.controller: Error retrieving channel", {
          userEmail: req.user.email,
          channelId,
          error,
        });
        res.status(500).json({ error: "Failed to retrieve channel" });
        return;
      }

      if (!channel) {
        logger.warn("instagram.post.controller: Channel not found", {
          userEmail: req.user.email,
          channelId,
        });
        res.status(404).json({ error: "Channel not found" });
        return;
      }

      // Verify the channel belongs to the user
      if (channel.user_id !== userId) {
        logger.warn(
          "instagram.post.controller: Unauthorized access to channel",
          {
            userEmail: req.user.email,
            channelId,
          }
        );
        res
          .status(403)
          .json({ error: "You don't have access to this channel" });
        return;
      }

      // Verify the channel is an Instagram channel
      if (channel.platform !== "instagram") {
        logger.warn("instagram.post.controller: Not an Instagram channel", {
          userEmail: req.user.email,
          channelId,
        });
        res.status(400).json({ error: "Channel is not an Instagram channel" });
        return;
      }

      // Verify the channel is connected (has an access token)
      if (!channel.access_token || !channel.connection_state) {
        logger.warn("instagram.post.controller: Channel not connected", {
          userEmail: req.user.email,
          channelId,
        });
        res.status(400).json({ error: "Instagram channel is not connected" });
        return;
      }

      // Get paginated posts from Instagram
      const posts = await instagramPostService.getPaginatedPosts(
        channel.access_token,
        Number(limit),
        after as string | undefined,
        before as string | undefined
      );

      logger.info(
        "instagram.post.controller: Successfully retrieved Instagram posts for channel",
        { userEmail: req.user.email, channelId, count: posts.data.length }
      );

      res.json(posts);
    } catch (error) {
      logger.error(
        "instagram.post.controller: Error retrieving Instagram posts for channel",
        { userEmail: req.user.email, error }
      );
      res.status(500).json({ error: "Failed to retrieve Instagram posts" });
    }
  };
}
