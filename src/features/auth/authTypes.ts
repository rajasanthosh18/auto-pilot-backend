export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: any;
    session?: any;
    profile?: Profile;
  };
}

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  email: string;
  updated_at?: string;
}
