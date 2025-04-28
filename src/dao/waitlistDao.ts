import { supabase } from "../config/supabase";
import { WaitlistEntry } from "../types/waitlist";

export class WaitlistDao {
  private readonly tableName = "waitlist";

  async create(entry: WaitlistEntry): Promise<WaitlistEntry | null> {
    console.log("[WaitlistDao] Attempting to create waitlist entry:", entry);
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([entry])
      .select()
      .single();

    if (error) {
      console.error("[WaitlistDao] Error creating waitlist entry:", error);
      throw error;
    }

    console.log("[WaitlistDao] Successfully created waitlist entry:", data);
    return data;
  }

  async getByEmail(email: string): Promise<WaitlistEntry | null> {
    console.log("[WaitlistDao] Checking for existing email:", email);
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq("email", email)
      .single();

    if (error) {
      console.log("[WaitlistDao] No entry found for email:", email);
      return null;
    }

    console.log("[WaitlistDao] Found entry for email:", data);
    return data;
  }

  async getByUsername(username: string): Promise<WaitlistEntry | null> {
    console.log("[WaitlistDao] Checking for existing username:", username);
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq("username", username)
      .single();

    if (error) {
      console.log("[WaitlistDao] No entry found for username:", username);
      return null;
    }

    console.log("[WaitlistDao] Found entry for username:", data);
    return data;
  }

  async getAllEntries(): Promise<WaitlistEntry[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching waitlist entries: ", error);
      throw error;
    }

    console.log("Fetched waitlist entries: ", data);

    return data || [];
  }
}
