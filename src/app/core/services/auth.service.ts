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
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data, {
      withCredentials: true,
    });
  }

  // set current user
  setUser(user: User): void {
    this.user.set(user);
  }

  // get current user
  getUser(): User | null {
    return this.user();
  }

  // initialize auth
  initializeAuth(): void {
    this.http
      .get<{ success: boolean; data: User }>(`${this.apiUrl}/me`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.user.set(response.data);
        },
        error: (error) => {
          if (error.status === 401) {
            this.user.set(null);
            return;
          }

          console.error('Failed to initialize authentication:', error);

          this.user.set(null);
        },
      });
  }

  // logout
  logoutAPI(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.user.set(null);
      },
      error: () => {
        this.user.set(null);
      },
    });
  }
}
