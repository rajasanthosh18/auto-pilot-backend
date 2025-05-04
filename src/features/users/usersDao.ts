import { logger } from "../../common/logger";
import { supabase } from "../../config/supabase";
import { User } from "./usersTypes";

export class UsersDao {
  private readonly tableName = "profiles";

  async getAllUsers(): Promise<User[]> {
    logger.debug("Fetching all users from profiles table");
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        logger.error("Failed to fetch users: %O", error);
        throw error;
      }

      logger.info("Successfully retrieved %d users", data?.length || 0);
      return data || [];
    } catch (error) {
      logger.error("Error in getAllUsers: %O", error);
      throw error;
    }
  }

  async getCurrentUser(token: string) {
    logger.debug("Fetching current user details");
    try {
      // First verify the token and get the user ID
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        logger.error("Failed to verify token: %O", authError);
        throw authError || new Error("User not found");
      }

      // Then fetch the user's profile details
      // const { data, error } = await supabase
      //   .from(this.tableName)
      //   .select("*")
      //   .eq("id", user.id)
      //   .single();

      // if (error) {
      //   logger.error("Failed to fetch user profile: %O", error);
      //   throw error;
      // }

      logger.info("Successfully retrieved current user details");
      return user.user_metadata;
    } catch (error) {
      logger.error("Error in getCurrentUser: %O", error);
      throw error;
    }
  }
}
