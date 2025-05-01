import cors from "cors";
import express from "express";
import { Server } from "http";
import { logger } from "./common/logger";
import { supabase } from "./config/supabase";
import { RouteLoader } from "./utils/routeLoader";

const app = express();
const port = process.env.PORT || 3000;
let server: Server;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  logger.debug("Health check endpoint called");
  res.json({ status: "healthy" });
});

// Verify database connection
async function verifyDatabaseConnection(): Promise<void> {
  try {
    const { error } = await supabase.from("waitlist").select("count").single();
    if (error && error.code !== "PGRST116") {
      throw error;
    }
    logger.info("Database connection verified successfully");
  } catch (error) {
    logger.error("Failed to connect to database: %O", error);
    throw error;
  }
}

// Initialize server
async function startServer() {
  try {
    // Verify database connection first
    await verifyDatabaseConnection();

    // Load routes
    await RouteLoader.loadRoutes(app);

    // Start server
    server = app.listen(port, () => {
      logger.info("Server started successfully");
      logger.info("Server is running on port %d", port);
      logger.debug("Debug logging is enabled");
    });

    // Keep the process running
    process.stdin.resume();
  } catch (error) {
    logger.error("Failed to start server: %O", error);
    process.exit(1);
  }
}

// Graceful shutdown
function shutDown() {
  logger.info("Received kill signal, shutting down gracefully");
  if (server) {
    server.close(() => {
      logger.info("Closed out remaining connections");
      process.exit(0);
    });

    // If connections don't close in 10s, force shutdown
    setTimeout(() => {
      logger.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);
  }
}

// Error handling
process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Promise Rejection: %O", reason);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception: %O", error);
  shutDown();
});

// Handle process signals
process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);

// Start the server
startServer();
