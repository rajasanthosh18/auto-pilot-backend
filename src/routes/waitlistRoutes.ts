import { Router } from "express";
import { WaitlistController } from "../controllers/waitlistController";
import { validateWaitlistEntry } from "../middleware/waitlistValidation";

const router = Router();
const waitlistController = new WaitlistController();

router.post("/join", validateWaitlistEntry, waitlistController.joinWaitlist);
router.get("/entries", waitlistController.getWaitlistEntries);

export default router;
