import { logger } from "../../common/logger";
import { supabase } from "../../common/supabase";

export class UserService {
  async createOrUpdateUser(email: string, fullName?: string) {
    try {
      logger.debug(
        "user.service.ts: createOrUpdateUser: Checking for existing user",
        { email }
      );
      // First try to get existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        logger.error(
          "user.service.ts: createOrUpdateUser: Error fetching existing user",
          { error: fetchError }
        );
        throw fetchError;
      }

      if (existingUser) {
        logger.debug(
          "user.service.ts: createOrUpdateUser: Updating existing user",
          { userId: existingUser.id }
        );
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

        if (updateError) {
          logger.error(
            "user.service.ts: createOrUpdateUser: Error updating user",
            { error: updateError }
          );
          throw updateError;
        }
        logger.info(
          "user.service.ts: createOrUpdateUser: Successfully updated user",
          { userId: updatedUser.id }
        );
        return updatedUser;
      } else {
        logger.debug("user.service.ts: createOrUpdateUser: Creating new user", {
          email,
        });
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            email,
            full_name: fullName,
          })
          .select()
          .single();

        if (createError) {
          logger.error(
            "user.service.ts: createOrUpdateUser: Error creating user",
            { error: createError }
          );
          throw createError;
        }
        logger.info(
          "user.service.ts: createOrUpdateUser: Successfully created new user",
          { userId: newUser.id }
        );
        return newUser;
      }
    } catch (error) {
      logger.error(
        "user.service.ts: createOrUpdateUser: Error in create/update user operation",
        { error }
      );
      throw error;
    }
  }
}
