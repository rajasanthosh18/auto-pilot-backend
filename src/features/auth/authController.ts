import { Request, Response } from "express";
import { logger } from "../../common/logger";
import { AuthService } from "./authService";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signInWithGoogle = async (_req: Request, res: Response): Promise<void> => {
    try {
      logger.info("Initiating Google sign-in");
      const result = await this.authService.signInWithGoogle();
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error("Error in signInWithGoogle controller: %O", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  handleAuthCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        res.status(401).json({
          success: false,
          message: "No authorization token provided",
        });
        return;
      }

      logger.info("Processing auth callback");
      const result = await this.authService.handleAuthCallback(token);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error("Error in handleAuthCallback controller: %O", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      logger.info("Fetching profile for user: %s", userId);
      const result = await this.authService.getProfile(userId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error("Error in getProfile controller: %O", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
