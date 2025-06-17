import { Router } from "express";
import { InstagramDMController } from "./dm.controller";

const router = Router();
const instagramDMController = new InstagramDMController();

// Send templated message with buttons
router.post(
  "/channel/:channelId/template",
  instagramDMController.sendTemplatedMessage
);

export default router;
