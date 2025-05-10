import axios from "axios";
import { logger } from "../../common/logger";
import { config } from "../../config";

interface TokenResponse {
  access_token: string;
  user_id: string;
  permissions: string;
}

interface LongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface InstagramBusinessAccount {
  id: string;
  username: string;
  name: string;
}

interface InstagramUserProfile {
  id: string;
  user_id: string;
  username: string;
  name: string;
  account_type: "Business" | "Media_Creator";
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
}

export class InstagramService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly apiVersion: string = "v19.0";

  constructor() {
    this.clientId = config.instagram.clientId;
    this.clientSecret = config.instagram.clientSecret;
    this.redirectUri = config.instagram.redirectUri;
  }

  getAuthUrl(): string {
    const scopes = [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_content_publish",
    ];
    const scopeString = scopes.join(",");

    return `https://www.instagram.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scopeString}&response_type=code&enable_fb_login=0&force_authentication=1`;
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      if (!code) {
        logger.error("No code provided for token exchange");
        throw new Error("Authorization code is required");
      }

      logger.debug("Exchanging authorization code for access token");
      const response = await axios.post<{ data: TokenResponse[] }>(
        "https://api.instagram.com/oauth/access_token",
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "authorization_code",
          redirect_uri: this.redirectUri,
          code,
        }
      );

      logger.debug("response %O", response.data.data);

      if (!response.data?.data?.[0]?.access_token) {
        logger.error("Invalid response format from Instagram token exchange");
        throw new Error("Invalid response from Instagram API");
      }

      const requiredPermissions = new Set([
        "instagram_business_basic",
        "instagram_business_manage_messages",
        "instagram_business_manage_comments",
        "instagram_business_content_publish",
      ]);

      const grantedPermissions = new Set(
        response.data.data[0].permissions.split(",")
      );
      const missingPermissions = [...requiredPermissions].filter(
        (permission) => !grantedPermissions.has(permission)
      );

      if (missingPermissions.length > 0) {
        logger.error(
          "Missing required permissions: %s",
          missingPermissions.join(", ")
        );
        throw new Error(
          `Missing required permissions: ${missingPermissions.join(", ")}`
        );
      }

      logger.debug("Successfully exchanged code for access token");
      return {
        access_token: response.data.data[0].access_token,
        user_id: response.data.data[0].user_id,
        permissions: response.data.data[0].permissions,
      };
    } catch (error: any) {
      logger.error("Error exchanging code for token: %O", error);
      if (error.response?.data?.error_type === "OAuthException") {
        throw new Error(
          `Instagram OAuth Error: ${error.response.data.error_message}`
        );
      }
      throw error;
    }
  }

  async getLongLivedToken(
    shortLivedToken: string
  ): Promise<LongLivedTokenResponse> {
    try {
      logger.debug("Exchanging short-lived token for long-lived token");
      const response = await axios.get(
        "https://graph.instagram.com/access_token",
        {
          params: {
            grant_type: "ig_exchange_token",
            client_secret: this.clientSecret,
            access_token: shortLivedToken,
          },
        }
      );

      if (!response.data?.access_token) {
        logger.error("Invalid response format from Instagram token exchange");
        throw new Error("Invalid response from Instagram API");
      }

      logger.debug("Successfully exchanged for long-lived token");
      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
      };
    } catch (error: any) {
      logger.error("Error exchanging for long-lived token: %O", error);
      if (error.response?.data?.error) {
        throw new Error(
          `Instagram Token Exchange Error: ${error.response.data.error.message}`
        );
      }
      throw error;
    }
  }

  async refreshLongLivedToken(longLivedToken: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    try {
      logger.debug("Refreshing long-lived token");
      const response = await axios.get(
        `https://graph.instagram.com/refresh_access_token`,
        {
          params: {
            grant_type: "ig_refresh_token",
            access_token: longLivedToken,
          },
        }
      );

      if (!response.data?.access_token) {
        logger.error("Invalid response format from Instagram token refresh");
        throw new Error("Invalid response from Instagram API");
      }

      logger.debug("Successfully refreshed long-lived token");
      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
      };
    } catch (error: any) {
      logger.error("Error refreshing long-lived token: %O", error);
      if (error.response?.data?.error) {
        throw new Error(
          `Instagram Token Refresh Error: ${error.response.data.error.message}`
        );
      }
      throw error;
    }
  }

  async getInstagramUserProfile(
    instagramUserId: string,
    accessToken: string
  ): Promise<InstagramUserProfile> {
    try {
      const response = await axios.get<{ data: InstagramUserProfile }>(
        `https://graph.instagram.com/${this.apiVersion}/me`,
        {
          params: {
            access_token: accessToken,
            fields:
              "id,user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count",
          },
        }
      );

      return response.data.data;
    } catch (error) {
      logger.error("Error fetching Instagram user profile: %O", error);
      throw error;
    }
  }
}
