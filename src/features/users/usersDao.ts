import { Channel } from "node:diagnostics_channel";
import { logger } from "../../common/logger";
import { supabase } from "../../config/supabase";
import { User } from "./usersTypes";

export class UsersDao {
  private readonly tableName = "profiles";

  async getAllUsers(): Promise<User[]> {
    logger.debug(
      "usersDao.ts: getAllUsers: Fetching all users from profiles table"
    );
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        logger.error("usersDao.ts: getAllUsers: Failed to fetch users", {
          error,
        });
        throw error;
      }

      logger.info("usersDao.ts: getAllUsers: Successfully retrieved users", {
        count: data?.length || 0,
      });
      return data || [];
    } catch (error) {
      logger.error("usersDao.ts: getAllUsers: Error retrieving users", {
        error,
      });
      throw error;
    }
  }

  async getCurrentUser(userId: string): Promise<Channel[]> {
    logger.debug("usersDao.ts: getCurrentUser: Fetching current user details");
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*, channels(*)")
        .eq("id", userId);

      if (error) {
        logger.error(
          "usersDao.ts: getCurrentUser: Failed to fetch user profile with channels",
          { error }
        );
        throw error;
      }

      logger.info(
        "usersDao.ts: getCurrentUser: Successfully retrieved current user with channels"
      );
      return (data?.[0]?.channels as Channel[]) || [];
    } catch (error) {
      logger.error(
        "usersDao.ts: getCurrentUser: Error retrieving current user",
        { error }
      );
      throw error;
    }
  }
}
