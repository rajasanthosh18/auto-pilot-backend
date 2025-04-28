import { WaitlistDao } from "../dao/waitlistDao";
import { WaitlistEntry, WaitlistResponse } from "../types/waitlist";

export class WaitlistService {
  private waitlistDao: WaitlistDao;

  constructor() {
    this.waitlistDao = new WaitlistDao();
  }

  async joinWaitlist(entry: WaitlistEntry): Promise<WaitlistResponse> {
    try {
      console.log(
        "[WaitlistService] Checking for existing email:",
        entry.email
      );
      const existingEmail = await this.waitlistDao.getByEmail(entry.email);
      if (existingEmail) {
        console.log("[WaitlistService] Email already exists:", entry.email);
        return {
          success: false,
          message: "Email already registered in waitlist",
        };
      }

      console.log(
        "[WaitlistService] Checking for existing username:",
        entry.username
      );
      const existingUsername = await this.waitlistDao.getByUsername(
        entry.username
      );
      if (existingUsername) {
        console.log(
          "[WaitlistService] Username already exists:",
          entry.username
        );
        return {
          success: false,
          message: "Username already taken",
        };
      }

      console.log("[WaitlistService] Creating new waitlist entry");
      const newEntry = await this.waitlistDao.create(entry);
      console.log(
        "[WaitlistService] Successfully created waitlist entry:",
        newEntry
      );
      return {
        success: true,
        message: "Successfully joined waitlist",
        data: newEntry || undefined,
      };
    } catch (error) {
      console.error("[WaitlistService] Error in joinWaitlist:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to join waitlist",
      };
    }
  }

  async getWaitlistEntries(): Promise<WaitlistResponse> {
    try {
      const entries = await this.waitlistDao.getAllEntries();
      return {
        success: true,
        message: "Waitlist entries retrieved successfully",
        data: entries[0],
      };
    } catch (error) {
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
