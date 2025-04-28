import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import waitlistRoutes from "./routes/waitlistRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/waitlist", waitlistRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
