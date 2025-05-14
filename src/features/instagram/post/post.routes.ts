import { Router } from "express";
import { InstagramPostController } from "./post.controller";

const router = Router();
const instagramPostController = new InstagramPostController();

// Get paginated Instagram posts with comments enabled
router.get("/", instagramPostController.getPaginatedPosts);

// Get paginated Instagram posts for a specific channel
router.get("/channel/:channelId", instagramPostController.getPostsByChannelId);

export default router;
