import { logger } from "../../common/logger";
import { supabase } from "../../common/supabase";

export class UserService {
  async createOrUpdateUser(email: string, fullName?: string) {
    try {
      // First try to get existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update({
            full_name: fullName || existingUser.full_name,
            updated_at: new Date(),
          })
          .eq("id", existingUser.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedUser;
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            email,
            full_name: fullName,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newUser;
      }
    } catch (error) {
      logger.error("Error creating/updating user: %O", error);
      throw error;
    }
  }
}
