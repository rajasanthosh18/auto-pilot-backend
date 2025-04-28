export interface WaitlistEntry {
  id?: string;
  username: string;
  email: string;
  created_at?: string;
}

export interface WaitlistResponse {
  success: boolean;
  message: string;
  data?: WaitlistEntry;
}
