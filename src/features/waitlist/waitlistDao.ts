import { logger } from "../../common/logger";
import { supabase } from "../../config/supabase";
import { WaitlistEntry } from "./waitlistTypes";

export class WaitlistDao {
  private readonly tableName = "waitlist";

  async create(entry: WaitlistEntry): Promise<WaitlistEntry | null> {
    logger.debug("Attempting to create waitlist entry: %O", entry);
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([entry])
        .select()
        .single();

      if (error) {
        logger.error("Failed to create waitlist entry: %O", error);
        throw error;
      }

      logger.info("Successfully created waitlist entry for: %s", entry.email);
      return data;
    } catch (error) {
      logger.error("Error in create: %O", error);
      throw error;
    }
  }

  async getByEmail(email: string): Promise<WaitlistEntry | null> {
    logger.debug("Checking for existing email: %s", email);
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select()
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          logger.info("No entry found for email: %s", email);
          return null;
        }
        logger.error("Error querying by email: %O", error);
        throw error;
      }

      logger.debug("Found entry for email: %O", data);
      return data;
    } catch (error) {
      logger.error("Error in getByEmail: %O", error);
      throw error;
    }
  }

  async getByUsername(username: string): Promise<WaitlistEntry | null> {
    logger.debug("Checking for existing username: %s", username);
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select()
        .eq("username", username)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          logger.info("No entry found for username: %s", username);
          return null;
        }
        logger.error("Error querying by username: %O", error);
        throw error;
      }

      logger.debug("Found entry for username: %O", data);
      return data;
    } catch (error) {
      logger.error("Error in getByUsername: %O", error);
      throw error;
    }
  }

  async getAllEntries(): Promise<WaitlistEntry[]> {
    logger.debug("Fetching all waitlist entries");
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("Failed to fetch waitlist entries: %O", error);
        throw error;
      }

      logger.info(
        "Successfully retrieved %d waitlist entries",
        data?.length || 0
      );
      return data || [];
    } catch (error) {
      logger.error("Error in getAllEntries: %O", error);
      throw error;
    }
  }
}
