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

  // logout
  logoutAPI() {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true },
    );
  }

  // set current user
  setUser(user: User | null): void {
    this.user.set(user);
  }

  // get current user
  getUser(): User | null {
    return this.user();
  }

  // tracks whether the initial authentication check has completed
  authInitialized = signal(false);

  // reuse the same request if multiple guards run at once
  private authInitialization: Promise<void> | null = null;

  // initialize auth and wait for the server response
  initializeAuth(): Promise<void> {
    if (this.authInitialized()) {
      return Promise.resolve();
    }

    if (this.authInitialization) {
      return this.authInitialization;
    }

    this.authInitialization = new Promise<void>((resolve) => {
      this.http
        .get<{ success: boolean; data: User }>(`${this.apiUrl}/me`, { withCredentials: true })
        .subscribe({
          next: (response) => {
            this.user.set(response.data);
            this.authInitialized.set(true);
            resolve();
          },
          error: (error) => {
            this.user.set(null);

            if (error.status !== 401) {
              console.error('Failed to initialize authentication:', error);
            }

            this.authInitialized.set(true);
            resolve();
          },
        });
    });

    return this.authInitialization;
  }
}
