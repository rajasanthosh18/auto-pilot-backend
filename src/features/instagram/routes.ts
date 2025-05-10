import { Router } from "express";
import { IRouter } from "../../types/router";
import instagramRoutes from "./instagram.routes";

const router = Router();

// Mount Instagram routes
router.use("/instagram", instagramRoutes);

export default {
  path: "/social",
  router,
} as IRouter;
