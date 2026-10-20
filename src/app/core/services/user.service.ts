import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

import { AuthService } from './auth.service';
import { User, Currency, Theme, DateFormat } from '../models/user.model';
import { environment } from '../../../environments/environment';

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface ProfileUpdateRequest {
  username?: string;
  profilePic?: string;
}

export interface PreferencesUpdateRequest {
  currency?: Currency;
  preferredTheme?: Theme;
  dateFormat?: DateFormat;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeactivateAccountRequest {
  currentPassword?: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = `${environment.apiUrl}/users/me`;

  // get the authenticated user's latest details
  getCurrentUser() {
    return this.http
      .get<UserResponse>(`${this.apiUrl}/me`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.authService.setUser(response.data);
        }),
      );
  }

  // update username and profile picture
  updateProfile(data: ProfileUpdateRequest) {
    return this.http
      .patch<UserResponse>(`${this.apiUrl}/profile`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.authService.setUser(response.data);
        }),
      );
  }

  // update currency, theme and date format
  updatePreferences(data: PreferencesUpdateRequest) {
    return this.http
      .patch<UserResponse>(`${this.apiUrl}/preferences`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.authService.setUser(response.data);
        }),
      );
  }

  // change password
  changePassword(data: ChangePasswordRequest) {
    return this.http.patch<MessageResponse>(`${this.apiUrl}/password`, data, {
      withCredentials: true,
    });
  }

  // deactivate the current account
  deactivateAccount(data: DeactivateAccountRequest = {}) {
    return this.http.patch<MessageResponse>(`${this.apiUrl}/deactivate`, data, {
      withCredentials: true,
    });
  }
}
