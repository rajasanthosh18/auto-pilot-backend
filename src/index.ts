import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { RouteLoader } from "./utils/routeLoader";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy" });
});

// Load all routes automatically
RouteLoader.loadRoutes(app).catch((err) => {
  console.error("Failed to load routes:", err);
  process.exit(1);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
