import axios from "axios";
import { logger } from "../../../common/logger";

export interface InstagramPost {
  id: string;
  caption?: string;
  media_url?: string;
  media_type: string;
  timestamp: string;
  permalink?: string;
  username?: string;
  is_comment_enabled?: boolean;
  comments_count?: number;
}

export interface InstagramPostsResponse {
  data: InstagramPost[];
  paging?: {
    cursors: {
      before?: string;
      after?: string;
    };
    next?: string;
  };
}

export class InstagramPostService {
  private readonly apiVersion: string = "v22.0";

  /**
   * Get paginated Instagram posts with only posts that have comments enabled
   * @param accessToken Instagram access token
   * @param limit Number of posts to retrieve
   * @param after Cursor for pagination (after)
   * @param before Cursor for pagination (before)
   * @returns Paginated Instagram posts
   */
  async getPaginatedPosts(
    accessToken: string,
    limit: number = 25,
    after?: string,
    before?: string
  ): Promise<InstagramPostsResponse> {
    try {
      logger.info("instagram.post.service: Getting paginated Instagram posts");

      // First, fetch posts from Instagram API
      const response = await axios.get(
        `https://graph.instagram.com/${this.apiVersion}/me/media`,
        {
          params: {
            access_token: accessToken,
            fields:
              "id,caption,media_url,media_type,timestamp,permalink,username,is_comment_enabled,comments_count",
            limit: limit * 2, // Request more posts initially to account for filtering
            after,
            before,
          },
        }
      );

      if (!response.data || !response.data.data) {
        logger.error(
          "instagram.post.service: Invalid response from Instagram API"
        );
        throw new Error("Invalid response from Instagram API");
      }

      // Filter posts to only include those with comments enabled
      const filteredPosts = response.data.data.filter(
        (post: InstagramPost) => post.is_comment_enabled === true
      );

      // Apply the requested limit to the filtered posts
      const limitedPosts = filteredPosts.slice(0, limit);

      logger.debug(
        "instagram.post.service: Successfully retrieved filtered Instagram posts",
        {
          totalFetched: response.data.data.length,
          withCommentsEnabled: filteredPosts.length,
          returned: limitedPosts.length,
        }
      );

      // Return the formatted response with pagination info
      return {
        data: limitedPosts,
        paging: response.data.paging,
      };
    } catch (error: any) {
      logger.error("instagram.post.service: Error fetching Instagram posts", {
        error,
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
