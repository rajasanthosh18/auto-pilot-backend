/**
 * Database table types for the application
 * Generated from Supabase/PostgreSQL schema
 */

export type Channel = {
  id: string; // uuid
  user_id: string | null; // uuid
  platform: string; // text
  name: string | null; // text
  access_token: string | null; // text
  created_at: Date | null; // timestamp with time zone
  connection_state: boolean | null; // boolean
  profile_url: string | null; // text
};

export type User = {
  id: string; // uuid
  email: string; // text
  full_name: string | null; // text
  created_at: Date | null; // timestamp with time zone
  updated_at: Date | null; // timestamp with time zone
};

export type Waitlist = {
  id: string; // uuid
  username: string; // text
  email: string; // text
  created_at: Date; // timestamp with time zone
};

// Database schema type that includes all tables
export type Database = {
  channels: Channel;
  users: User;
  waitlist: Waitlist;
};

// Type for inserting new records (omits auto-generated fields)
export type ChannelInsert = {
  user_id: string;
  platform: string;
  name?: string | null;
  access_token?: string | null;
  profile_url?: string | null;
  connection_state?: boolean | null;
};
export type UserInsert = Omit<User, "id" | "created_at" | "updated_at">;
export type WaitlistInsert = Omit<Waitlist, "id" | "created_at">;

// Type for updating records (makes all fields optional)
export type ChannelUpdate = Partial<ChannelInsert>;
export type UserUpdate = Partial<UserInsert>;
export type WaitlistUpdate = Partial<WaitlistInsert>;
