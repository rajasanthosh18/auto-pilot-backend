import { NextFunction, Request, Response } from "express";
import { logger } from "../common/logger";
import { supabase } from "../common/supabase";
import { UserService } from "../features/users/user.service";
import { ExtendedUser } from "../types/user";

const userService = new UserService();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.debug("Auth middleware called");
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn("No authorization header provided");
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      logger.warn("No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    logger.debug("Verifying token");
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.error("Auth error: %O", error);
      return res.status(401).json({ error: "Invalid token" });
    }

    logger.debug("Token verified, creating/updating user in database");
    // Create or update user in our database
    try {
      const dbUser = await userService.createOrUpdateUser(
        user.email!,
        user.user_metadata?.full_name
      );
      req.user = { ...user, db_id: dbUser.id } as ExtendedUser;
    } catch (error) {
      logger.error("Error creating/updating user: %O", error);
      return res.status(500).json({ error: "Failed to process user data" });
    }

    logger.debug("User created/updated, calling next middleware");
    next();
  } catch (error) {
    logger.error("Auth middleware error: %O", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
