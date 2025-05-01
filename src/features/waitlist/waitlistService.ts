import { logger } from "../../common/logger";
import { WaitlistDao } from "./waitlistDao";
import { WaitlistEntry, WaitlistResponse } from "./waitlistTypes";

export class WaitlistService {
  private waitlistDao: WaitlistDao;

  constructor() {
    this.waitlistDao = new WaitlistDao();
  }

  async joinWaitlist(entry: WaitlistEntry): Promise<WaitlistResponse> {
    try {
      logger.info("Processing new waitlist join request");
      logger.debug("Entry details: %O", entry);

      const existingEmail = await this.waitlistDao.getByEmail(entry.email);
      if (existingEmail) {
        logger.warn("Duplicate email attempt: %s", entry.email);
        return {
          success: false,
          message: "Email already registered in waitlist",
        };
      }

      const existingUsername = await this.waitlistDao.getByUsername(
        entry.username
      );
      if (existingUsername) {
        logger.warn("Duplicate username attempt: %s", entry.username);
        return {
          success: false,
          message: "Username already registered in waitlist",
        };
      }

      logger.debug("Creating new waitlist entry");
      const newEntry = await this.waitlistDao.create(entry);
      logger.info("Successfully created waitlist entry for: %s", entry.email);

      return {
        success: true,
        message: "Successfully joined waitlist",
        data: newEntry || undefined,
      };
    } catch (error) {
      logger.error("Error in joinWaitlist: %O", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to join waitlist",
      };
    }
  }

  async getWaitlistEntries(): Promise<WaitlistResponse> {
    try {
      logger.debug("Retrieving all waitlist entries");
      const entries = await this.waitlistDao.getAllEntries();
      logger.info("Successfully retrieved %d waitlist entries", entries.length);

      return {
        success: true,
        message: "Waitlist entries retrieved successfully",
        data: entries as any,
      };
    } catch (error) {
      logger.error("Error in getWaitlistEntries: %O", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve waitlist entries",
      };
    }
  }
}
