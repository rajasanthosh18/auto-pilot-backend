import { Router } from "express";
import { InstagramController } from "./instagram.controller";

const router = Router();
const instagramController = new InstagramController();

// Get Instagram authentication URL
router.get("/auth/url", instagramController.getAuthUrl);

// Handle Instagram callback
router.get("/auth/callback", instagramController.handleCallback);

export default router;
