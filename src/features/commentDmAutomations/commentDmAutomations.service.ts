import { logger } from "../../common/logger";
import { CommentDmAutomation } from "../../types/database.types";
import { insertCommentDmAutomation } from "./commentDmAutomations.dao";
import { CreateCommentDmAutomationRequest } from "./commentDmAutomations.types";

export async function createCommentDmAutomationService(
  body: CreateCommentDmAutomationRequest
): Promise<CommentDmAutomation | null> {
  try {
    const automation = {
      channel_id: body.channelId,
      post_id: body.postId,
      trigger_words: body.triggerWords,
      match_type: body.matchType,
      opening_enabled: body.dmMessage.opening.enabled,
      opening_text: body.dmMessage.opening.text || null,
      main_text: body.dmMessage.main.text,
      buttons: body.dmMessage.main.buttons,
    };
    const result = await insertCommentDmAutomation(automation);
    logger.info(
      "commentDmAutomations.service.ts: createCommentDmAutomationService: Automation created",
      { automation }
    );
    return result;
  } catch (error) {
    logger.error(
      "commentDmAutomations.service.ts: createCommentDmAutomationService: Error creating automation",
      { error }
    );
    return null;
  }
}
