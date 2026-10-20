export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: User;
}

export type Theme = 'light' | 'dark';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export type UserRole = 'user' | 'admin';

export type AuthProvider = 'local' | 'google';

export interface User {
  _id: string;
  username: string;
  email: string;
  profilePic: string;
  provider: AuthProvider;
  currency: Currency;
  preferredTheme: Theme;
  dateFormat: DateFormat;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
