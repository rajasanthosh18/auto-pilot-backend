export interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  email: string;
  updated_at: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: User[];
}
