import { logger } from "../../common/logger";
import { ExtendedUser } from "../../types/user";
import { UsersDao } from "./usersDao";
import { UserResponse } from "./usersTypes";

export class UsersService {
  private usersDao: UsersDao;

  constructor() {
    this.usersDao = new UsersDao();
  }

  async getAllUsers(): Promise<UserResponse> {
    try {
      logger.debug("usersService.ts: getAllUsers: Retrieving all users");
      const users = await this.usersDao.getAllUsers();
      logger.info(
        "usersService.ts: getAllUsers: Successfully retrieved users",
        { count: users.length }
      );

      return {
        success: true,
        message: "Users retrieved successfully",
        data: users,
      };
    } catch (error) {
      logger.error("usersService.ts: getAllUsers: Error retrieving users", {
        error,
      });
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to retrieve users",
      };
    }
  }

  async getCurrentUser(user: ExtendedUser) {
    try {
      logger.debug(
        "usersService.ts: getCurrentUser: Retrieving current user details"
      );
      const channels = await this.usersDao.getCurrentUser(user.db_id);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      logger.info(
        "usersService.ts: getCurrentUser: Successfully retrieved current user details"
      );
      return {
        success: true,
        message: "Current user retrieved successfully",
        data: {
          ...user.user_metadata,
          channels: channels,
        },
      };
    } catch (error) {
      logger.error(
        "usersService.ts: getCurrentUser: Error retrieving current user",
        { error }
      );
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
