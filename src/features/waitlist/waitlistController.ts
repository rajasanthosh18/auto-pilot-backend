import { Request, Response } from "express";
import { logger } from "../../common/logger";
import { WaitlistService } from "./waitlistService";
import { WaitlistEntry } from "./waitlistTypes";

export class WaitlistController {
  private waitlistService: WaitlistService;

  constructor() {
    this.waitlistService = new WaitlistService();
  }

  joinWaitlist = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info("Received waitlist join request");
      logger.debug("Join request details: %O", {
        email: req.body.email,
        username: req.body.username,
      });

      const waitlistEntry: WaitlistEntry = {
        email: req.body.email,
        username: req.body.username,
      };

      const result = await this.waitlistService.joinWaitlist(waitlistEntry);

      if (result.success) {
        logger.info("Successfully added user to waitlist");
        logger.debug("Join waitlist result: %O", result);
      } else {
        logger.warn("Failed to add user to waitlist: %s", result.message);
      }

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      logger.error("Error in joinWaitlist: %O", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getWaitlistEntries = async (_req: Request, res: Response): Promise<void> => {
    try {
      logger.debug("Fetching all waitlist entries");
      const result = await this.waitlistService.getWaitlistEntries();

      if (result.success) {
        logger.info("Successfully retrieved waitlist entries");
      } else {
        logger.warn("Failed to retrieve waitlist entries: %s", result.message);
      }

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error("Error in getWaitlistEntries: %O", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
