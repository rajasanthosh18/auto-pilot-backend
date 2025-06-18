import { Request, Response } from "express";
import { logger } from "../../common/logger";
import { createCommentDmAutomationService } from "./commentDmAutomations.service";

export async function createCommentDmAutomationController(
  req: Request,
  res: Response
) {
  try {
    const automation = await createCommentDmAutomationService(req.body);
    if (!automation) {
      logger.error(
        "commentDmAutomations.controller.ts: createCommentDmAutomationController: Failed to create automation"
      );
      res.status(500).json({
        success: false,
        message: "Failed to create comment DM automation",
      });
      return;
    }
    logger.info(
      "commentDmAutomations.controller.ts: createCommentDmAutomationController: Automation created",
      { id: automation.id }
    );
    res.status(201).json({
      success: true,
      data: automation,
      message: "Comment DM automation created successfully",
    });
    return;
  } catch (error) {
    logger.error(
      "commentDmAutomations.controller.ts: createCommentDmAutomationController: Error",
      { error }
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}
