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
      logger.debug("usersController.ts: getAllUsers: Fetching all users");
      const result = await this.usersService.getAllUsers();

      if (result.success) {
        logger.info(
          "usersController.ts: getAllUsers: Successfully retrieved users"
        );
      } else {
        logger.warn(
          "usersController.ts: getAllUsers: Failed to retrieve users",
          { message: result.message }
        );
      }

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error("usersController.ts: getAllUsers: Error retrieving users", {
        error,
      });
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.debug(
        "usersController.ts: getCurrentUser: Fetching current user details"
      );
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        res.status(401).json({
          success: false,
          message: "No authorization token provided",
        });
        return;
      }

      const result = await this.usersService.getCurrentUser(req.user);

      if (result.success) {
        logger.info(
          "usersController.ts: getCurrentUser: Successfully retrieved current user"
        );
      } else {
        logger.warn(
          "usersController.ts: getCurrentUser: Failed to retrieve current user",
          { message: result.message }
        );
      }

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error(
        "usersController.ts: getCurrentUser: Error retrieving current user",
        { error }
      );
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
