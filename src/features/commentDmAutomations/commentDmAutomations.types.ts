// Request type for creating a comment DM automation
export type CreateCommentDmAutomationRequest = {
  channelId: string;
  postId: string;
  triggerWords: string[];
  matchType: "any" | "all";
  dmMessage: {
    opening: {
      enabled: boolean;
      text?: string;
    };
    main: {
      text: string;
      buttons: { label: string; url: string }[];
    };
  };
};

// Response type (using ApiResponse from rulebook)
import { CommentDmAutomation } from "../../types/database.types";

export type CreateCommentDmAutomationResponse = {
  success: boolean;
  data?: CommentDmAutomation;
  message?: string;
};
