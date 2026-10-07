export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: User;
}
