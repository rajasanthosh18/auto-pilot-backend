"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const routeLoader_1 = require("./utils/routeLoader");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Render sets PORT env variable automatically
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy" });
});
// Load all routes automatically
routeLoader_1.RouteLoader.loadRoutes(app).catch((err) => {
    console.error("Failed to load routes:", err);
    process.exit(1);
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
