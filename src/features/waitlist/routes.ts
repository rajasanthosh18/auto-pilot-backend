import { Router } from "express";
import { IRouter } from "../../types/router";
import { WaitlistController } from "./waitlistController";
import { validateWaitlistEntry } from "./waitlistValidation";

const router = Router();
const controller = new WaitlistController();

router.post("/join", validateWaitlistEntry, controller.joinWaitlist);
router.get("/entries", controller.getWaitlistEntries);

export default {
  path: "/waitlist",
  router,
} as IRouter;
