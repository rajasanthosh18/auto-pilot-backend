import { supabase } from "../../config/supabase";
import {
  CommentDmAutomation,
  CommentDmAutomationInsert,
} from "../../types/database.types";

export async function insertCommentDmAutomation(
  automation: CommentDmAutomationInsert
): Promise<CommentDmAutomation | null> {
  const { data, error } = await supabase
    .from("comment_dm_automations")
    .insert([automation])
    .select()
    .single();

  if (error) {
    // Optionally log error here
    return null;
  }
  return data;
}
