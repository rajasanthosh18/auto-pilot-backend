import { logger } from "../../common/logger";
import { supabase } from "../../config/supabase";
import { AuthResponse, Profile } from "./authTypes";

export class AuthService {
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.CLIENT_URL}/auth/callback`,
        },
      });

      if (error) {
        logger.error("Google sign-in error: %O", error);
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: true,
        message: "Google sign-in URL generated successfully",
        data: data as any,
      };
    } catch (error) {
      logger.error("Error in signInWithGoogle: %O", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to sign in with Google",
      };
    }
  }

  async handleAuthCallback(token: string): Promise<AuthResponse> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        logger.error("Auth callback error: %O", error);
        return {
          success: false,
          message: error?.message || "User not found",
        };
      }

      // Create or update user profile
      const profile: Profile = {
        id: user.id,
        email: user.email!,
        username: user.email!.split("@")[0], // Default username from email
        full_name: user.user_metadata.full_name,
        avatar_url: user.user_metadata.avatar_url,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profile, { onConflict: "id" });

      if (profileError) {
        logger.error("Profile update error: %O", profileError);
        return {
          success: false,
          message: "Failed to update profile",
        };
      }

      return {
        success: true,
        message: "Authentication successful",
        data: {
          user,
          profile,
        },
      };
    } catch (error) {
      logger.error("Error in handleAuthCallback: %O", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process authentication",
      };
    }
  }

  async getProfile(userId: string): Promise<AuthResponse> {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        logger.error("Get profile error: %O", error);
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: true,
        message: "Profile retrieved successfully",
        data: { profile },
      };
    } catch (error) {
      logger.error("Error in getProfile: %O", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get profile",
      };
    }
  }
}
