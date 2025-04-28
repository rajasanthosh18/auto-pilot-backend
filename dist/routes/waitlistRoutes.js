"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const waitlistController_1 = require("../controllers/waitlistController");
const waitlistValidation_1 = require("../middleware/waitlistValidation");
const router = (0, express_1.Router)();
const waitlistController = new waitlistController_1.WaitlistController();
router.post("/join", waitlistValidation_1.validateWaitlistEntry, waitlistController.joinWaitlist);
router.get("/entries", waitlistController.getWaitlistEntries);
const waitlistRouter = {
    path: "/waitlist",
    router: router,
};
exports.default = waitlistRouter;
