import { logger } from "../../common/logger";
import { supabase } from "../../config/supabase";
import {
  Channel,
  ChannelInsert,
  ChannelUpdate,
} from "../../types/database.types";

export class ChannelsDao {
  /**
   * Creates a new channel in the database
   */
  static async createChannel(
    channelData: ChannelInsert
  ): Promise<{ data: Channel | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("channels")
        .insert(channelData)
        .select()
        .single();

      if (error) {
        logger.error("channels.dao.ts: createChannel: Error creating channel", {
          error,
        });
      }

      return { data, error };
    } catch (error) {
      logger.error(
        "channels.dao.ts: createChannel: Unexpected error creating channel",
        { error }
      );
      return { data: null, error };
    }
  }

  /**
   * Updates a channel's profile URL and connection state
   */
  static async updateChannelProfile(
    channelId: string,
    profileUrl: string
  ): Promise<{ data: Channel | null; error: any }> {
    try {
      const updateData: ChannelUpdate = {
        profile_url: profileUrl,
        connection_state: true,
      };

      const { data, error } = await supabase
        .from("channels")
        .update(updateData)
        .eq("id", channelId)
        .select()
        .single();

      if (error) {
        logger.error(
          "channels.dao.ts: updateChannelProfile: Error updating channel profile",
          { error }
        );
      }

      return { data, error };
    } catch (error) {
      logger.error(
        "channels.dao.ts: updateChannelProfile: Unexpected error updating channel profile",
        { error }
      );
      return { data: null, error };
    }
  }

  /**
   * Gets a channel by its ID
   */
  static async getChannelById(
    channelId: string
  ): Promise<{ data: Channel | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select()
        .eq("id", channelId)
        .single();

      if (error) {
        logger.error(
          "channels.dao.ts: getChannelById: Error fetching channel",
          { error }
        );
      }

      return { data, error };
    } catch (error) {
      logger.error(
        "channels.dao.ts: getChannelById: Unexpected error fetching channel",
        { error }
      );
      return { data: null, error };
    }
  }

  /**
   * Gets all channels for a user
   */
  static async getUserChannels(
    userId: string
  ): Promise<{ data: Channel[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select()
        .eq("user_id", userId);

      if (error) {
        logger.error(
          "channels.dao.ts: getUserChannels: Error fetching user channels",
          { error }
        );
      }

      return { data, error };
    } catch (error) {
      logger.error(
        "channels.dao.ts: getUserChannels: Unexpected error fetching user channels",
        { error }
      );
      return { data: null, error };
    }
  }
}
