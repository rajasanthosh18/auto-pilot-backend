import { Router } from "express";
import { InstagramController } from "./instagram.controller";
import postRoutes from "./post/post.routes";

const router = Router();
const instagramController = new InstagramController();

// Get Instagram authentication URL
router.get("/auth/url", instagramController.getAuthUrl);

// Handle Instagram callback
router.get("/auth/callback", instagramController.handleCallback);

// Mount post routes
router.use("/posts", postRoutes);

export default router;
