export interface User {
  id?: number;
  username: string;
  fullName?: string;
  full_name?: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  user?: User;
  token?: string;
  access_token?: string;
  refresh_token?: string;
}
