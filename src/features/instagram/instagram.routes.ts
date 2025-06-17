import { Router } from "express";
import dmRoutes from "./dm/dm.routes";
import { InstagramController } from "./instagram.controller";
import postRoutes from "./post/post.routes";

const router = Router();
const instagramController = new InstagramController();

// Get Instagram authentication URL
router.get("/auth/url", instagramController.getAuthUrl);

// Handle Instagram OAuth callback
router.get("/auth/callback", instagramController.handleCallback);

// Mount post routes
router.use("/posts", postRoutes);

// Mount DM routes
router.use("/dm", dmRoutes);

export default router;
