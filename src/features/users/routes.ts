import { Router } from "express";
import { IRouter } from "../../types/router";
import { UsersController } from "./usersController";

const router = Router();
const controller = new UsersController();

router.get("/", controller.getAllUsers);
router.get("/me", controller.getCurrentUser);

export default {
  path: "/users",
  router,
} as IRouter;
