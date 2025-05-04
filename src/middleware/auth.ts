import { NextFunction, Request, Response } from "express";
import { logger } from "../common/logger";
import { supabase } from "../config/supabase";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header provided",
      });
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace("Bearer ", "");

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Add the user to the request object for use in subsequent middleware/routes
    req.user = user;
    next();
  } catch (error) {
    logger.error("Auth middleware error: %O", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};
