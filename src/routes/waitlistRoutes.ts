import { Router } from "express";
import { WaitlistController } from "../controllers/waitlistController";
import { validateWaitlistEntry } from "../middleware/waitlistValidation";
import { IRouter } from "../types/router";

const router = Router();
const waitlistController = new WaitlistController();

router.post("/join", validateWaitlistEntry, waitlistController.joinWaitlist);
router.get("/entries", waitlistController.getWaitlistEntries);

const waitlistRouter: IRouter = {
  path: "/waitlist",
  router: router,
};

export default waitlistRouter;
