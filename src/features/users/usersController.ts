import { Request, Response } from "express";
import { logger } from "../../common/logger";
import { UsersService } from "./usersService";

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      logger.debug("Fetching all users");
      const result = await this.usersService.getAllUsers();

      if (result.success) {
        logger.info("Successfully retrieved users");
      } else {
        logger.warn("Failed to retrieve users: %s", result.message);
      }

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error("Error in getAllUsers: %O", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.debug("Fetching current user details");
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        res.status(401).json({
          success: false,
          message: "No authorization token provided",
        });
        return;
      }

      const result = await this.usersService.getCurrentUser(token);

      if (result.success) {
        logger.info("Successfully retrieved current user");
      } else {
        logger.warn("Failed to retrieve current user: %s", result.message);
      }

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error("Error in getCurrentUser: %O", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
