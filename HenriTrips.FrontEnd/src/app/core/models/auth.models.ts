export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserResponse {
  id: string;
  email: string;
  userName: string;
  roles: string[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: 'Admin' | 'User';
}
