import cors from "cors";
import express from "express";
import { logger } from "./common/logger";
import { RouteLoader } from "./utils/routeLoader";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load routes
RouteLoader.loadRoutes(app).catch((error) => {
  logger.error("Failed to load routes: %O", error);
  process.exit(1);
});

app.get("/health", (_req, res) => {
  logger.debug("Health check endpoint called");
  res.json({ status: "healthy" });
});

// Start server
app.listen(port, () => {
  logger.info("Server started successfully");
  logger.info("Server is running on port %d", port);
  logger.debug("Debug logging is enabled");
});

// Error handling
process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Promise Rejection: %O", reason);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception: %O", error);
  process.exit(1);
});
