import { Router } from "express";
import { validateSchema } from "../../common/validateBody";
import { IRouter } from "../../types/router";
import { createCommentDmAutomationController } from "./commentDmAutomations.controller";
import { createCommentDmAutomationSchema } from "./commentDmAutomations.schema";

const router = Router();

router.post(
  "/",
  validateSchema(createCommentDmAutomationSchema),
  createCommentDmAutomationController
);

export default {
  path: "/comment-dm-automations",
  router,
} as IRouter;
