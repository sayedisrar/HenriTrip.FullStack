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

// NEW: Wrapped API Response wrapper for Clean API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// NEW: Login response type (data contains the token string)
export type LoginApiResponse = ApiResponse<string>;

// NEW: Register response type
export interface RegisterResponseData {
  message: string;
  userId?: string;
}

export type RegisterApiResponse = ApiResponse<RegisterResponseData>;