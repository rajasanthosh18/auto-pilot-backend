import { supabase } from "../config/supabase";
import { WaitlistEntry } from "../types/waitlist";

export class WaitlistDao {
  private readonly tableName = "waitlist";

  async create(entry: WaitlistEntry): Promise<WaitlistEntry | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([entry])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getByEmail(email: string): Promise<WaitlistEntry | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq("email", email)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async getByUsername(username: string): Promise<WaitlistEntry | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq("username", username)
      .single();

    if (error) {
      return null;
    }

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
