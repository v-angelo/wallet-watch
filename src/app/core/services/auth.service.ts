import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  RegisterResponse,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  User,
} from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/auth`;

  // current authenticated user
  user = signal<User | null>(null);

  // register
  registerAPI(data: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  // login
  loginAPI(data: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data);
  }

  // store authentication data
  setAuthData(response: LoginResponse): void {
    localStorage.setItem('walletwatch-token', response.token);

    localStorage.setItem('walletwatch-user', JSON.stringify(response.data));

    this.user.set(response.data);
  }

  // get token
  getToken(): string | null {
    return localStorage.getItem('walletwatch-token');
  }

  // get current user
  getUser(): User | null {
    return this.user();
  }

  // check authentication
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // logout
  logout(): void {
    localStorage.removeItem('walletwatch-token');
    localStorage.removeItem('walletwatch-user');

    this.user.set(null);
  }
}
