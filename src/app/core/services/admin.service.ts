import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment';

export type AdminUserRole = 'user' | 'admin';
export type UserStatusFilter = 'all' | 'active' | 'inactive';

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  profilePic: string;
  provider: 'local' | 'google';
  currency: string;
  role: AdminUserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalTransactions: number;
  totalBudgets: number;
  totalSavingsGoals: number;
}

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
}

export interface AdminUsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    pagination: {
      totalUsers: number;
      currentPage: number;
      totalPages: number;
      limit: number;
    };
  };
}

export interface AdminMessageResponse {
  success: boolean;
  message: string;
  data?: {
    user?: Pick<AdminUser, '_id' | 'username' | 'email' | 'role' | 'isActive'>;
    deletedUserId?: string;
  };
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface GetAdminUsersParams {
  search?: string;
  status?: UserStatusFilter;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/admin`;

  // get dashboard statistics
  getAdminStats() {
    return this.http.get<AdminStatsResponse>(`${this.apiUrl}/stats`, {
      withCredentials: true,
    });
  }

  // get users with search, status filters and pagination
  getAllUsers(params: GetAdminUsersParams = {}) {
    let httpParams = new HttpParams();

    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page);
    }

    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit);
    }

    return this.http.get<AdminUsersResponse>(`${this.apiUrl}/users`, {
      params: httpParams,
      withCredentials: true,
    });
  }

  // activate or deactivate a user
  updateUserStatus(id: string, data: UpdateUserStatusRequest) {
    return this.http.patch<AdminMessageResponse>(`${this.apiUrl}/users/${id}/status`, data, {
      withCredentials: true,
    });
  }

  // delete a user and their associated financial records
  deleteUser(id: string) {
    return this.http.delete<AdminMessageResponse>(`${this.apiUrl}/users/${id}`, {
      withCredentials: true,
    });
  }
}
