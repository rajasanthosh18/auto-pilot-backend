import axios from "axios";
import { logger } from "../../common/logger";
import { config } from "../../config";

interface TokenResponse {
  access_token: string;
  user_id: string;
  permissions: string[];
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
        logger.error(
          "instagram.service.ts: exchangeCodeForToken: No code provided for token exchange"
        );
        throw new Error("Authorization code is required");
      }

      logger.debug(
        "instagram.service.ts: exchangeCodeForToken: Exchanging authorization code for access token"
      );
      const response = await axios.post<TokenResponse>(
        "https://api.instagram.com/oauth/access_token",
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "authorization_code",
          redirect_uri: this.redirectUri,
          code,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      logger.debug(
        "instagram.service.ts: exchangeCodeForToken: Token exchange response",
        { data: response.data }
      );

      if (!response.data?.access_token) {
        logger.error(
          "instagram.service.ts: exchangeCodeForToken: Invalid response format from Instagram token exchange"
        );
        throw new Error("Invalid response from Instagram API");
      }

      const requiredPermissions = new Set([
        "instagram_business_basic",
        "instagram_business_manage_messages",
        "instagram_business_manage_comments",
        "instagram_business_content_publish",
      ]);

      const grantedPermissions = new Set(response.data.permissions);
      const missingPermissions = [...requiredPermissions].filter(
        (permission) => !grantedPermissions.has(permission)
      );

      if (missingPermissions.length > 0) {
        logger.error(
          "instagram.service.ts: exchangeCodeForToken: Missing required permissions",
          { missingPermissions }
        );
        throw new Error(
          `Missing required permissions: ${missingPermissions.join(", ")}`
        );
      }

      logger.debug(
        "instagram.service.ts: exchangeCodeForToken: Successfully exchanged code for access token"
      );
      return {
        access_token: response.data.access_token,
        user_id: response.data.user_id,
        permissions: response.data.permissions,
      };
    } catch (error: any) {
      logger.error(
        "instagram.service.ts: exchangeCodeForToken: Error exchanging code for token",
        { error }
      );
      if (error.response?.data?.error_type === "OAuthException") {
        throw new Error(error.response.data.error_message);
      }
      throw error;
    }
  }

  async getLongLivedToken(
    shortLivedToken: string
  ): Promise<LongLivedTokenResponse> {
    try {
      logger.debug(
        "instagram.service.ts: getLongLivedToken: Exchanging short-lived token for long-lived token"
      );
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
        logger.error(
          "instagram.service.ts: getLongLivedToken: Invalid response format from Instagram token exchange"
        );
        throw new Error("Invalid response from Instagram API");
      }

      logger.debug(
        "instagram.service.ts: getLongLivedToken: Successfully exchanged for long-lived token"
      );
      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
      };
    } catch (error: any) {
      logger.error(
        "instagram.service.ts: getLongLivedToken: Error exchanging for long-lived token",
        { error }
      );
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
      logger.debug(
        "instagram.service.ts: refreshLongLivedToken: Refreshing long-lived token"
      );
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
        logger.error(
          "instagram.service.ts: refreshLongLivedToken: Invalid response format from Instagram token refresh"
        );
        throw new Error("Invalid response from Instagram API");
      }

      logger.debug(
        "instagram.service.ts: refreshLongLivedToken: Successfully refreshed long-lived token"
      );
      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
      };
    } catch (error: any) {
      logger.error(
        "instagram.service.ts: refreshLongLivedToken: Error refreshing long-lived token",
        { error }
      );
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
      logger.debug(
        "instagram.service.ts: getInstagramUserProfile: Fetching Instagram user profile"
      );
      const response = await axios.get<InstagramUserProfile>(
        `https://graph.instagram.com/${this.apiVersion}/me`,
        {
          params: {
            access_token: accessToken,
            fields:
              "id,user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count",
          },
        }
      );

      logger.debug(
        "instagram.service.ts: getInstagramUserProfile: Profile fetch response",
        { data: response.data }
      );
      return response.data;
    } catch (error) {
      logger.error(
        "instagram.service.ts: getInstagramUserProfile: Error fetching Instagram user profile",
        { error }
      );
      throw error;
    }
  }
}
