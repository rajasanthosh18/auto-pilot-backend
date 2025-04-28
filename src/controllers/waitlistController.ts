import { Request, Response } from "express";
import { WaitlistService } from "../services/waitlistService";
import { WaitlistEntry } from "../types/waitlist";

export class WaitlistController {
  private waitlistService: WaitlistService;

  constructor() {
    this.waitlistService = new WaitlistService();
  }

  joinWaitlist = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("[WaitlistController] Attempting to join waitlist:", {
        email: req.body.email,
        username: req.body.username,
      });
      const waitlistEntry: WaitlistEntry = {
        email: req.body.email,
        username: req.body.username,
      };

      const result = await this.waitlistService.joinWaitlist(waitlistEntry);
      console.log("[WaitlistController] Join waitlist result:", result);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error("[WaitlistController] Error in joinWaitlist:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getWaitlistEntries = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.waitlistService.getWaitlistEntries();
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
