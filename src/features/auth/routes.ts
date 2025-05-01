import { Router } from "express";
import { IRouter } from "../../types/router";
import { AuthController } from "./authController";

const router = Router();
const controller = new AuthController();

router.post("/google", controller.signInWithGoogle);
router.post("/callback", controller.handleAuthCallback);
router.get("/profile/:userId", controller.getProfile);

export default {
  path: "/auth",
  router,
} as IRouter;
