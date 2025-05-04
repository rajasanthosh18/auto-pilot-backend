import { logger } from "../../common/logger";
import { UsersDao } from "./usersDao";
import { UserResponse } from "./usersTypes";

export class UsersService {
  private usersDao: UsersDao;

  constructor() {
    this.usersDao = new UsersDao();
  }

  async getAllUsers(): Promise<UserResponse> {
    try {
      logger.debug("Retrieving all users");
      const users = await this.usersDao.getAllUsers();
      logger.info("Successfully retrieved %d users", users.length);

      return {
        success: true,
        message: "Users retrieved successfully",
        data: users,
      };
    } catch (error) {
      logger.error("Error in getAllUsers: %O", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to retrieve users",
      };
    }
  }

  async getCurrentUser(token: string) {
    try {
      logger.debug("Retrieving current user details");
      const user = await this.usersDao.getCurrentUser(token);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      logger.info("Successfully retrieved current user details");
      return {
        success: true,
        message: "Current user retrieved successfully",
        data: user,
      };
    } catch (error) {
      logger.error("Error in getCurrentUser: %O", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve current user",
      };
    }
  }
}
