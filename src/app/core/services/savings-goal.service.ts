import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type SavingsGoalStatus = 'active' | 'completed';

export interface SavingsGoalPayload {
  name: string;
  description?: string;
  targetAmount: number;
  savedAmount?: number;
  deadline?: string | null;
  icon?: string;
  color?: string;
}

export type UpdateSavingsGoalPayload = Partial<SavingsGoalPayload>;

export interface SavingsGoalData {
  _id: string;
  user: string;
  name: string;
  description: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string | null;
  icon: string;
  color: string;
  status: SavingsGoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoalResponse {
  success: boolean;
  message: string;
  count?: number;
  data: SavingsGoalData | SavingsGoalData[];
}

@Injectable({
  providedIn: 'root',
})
export class SavingsGoalService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/savings-goals`;

  getSavingsGoals(): Observable<SavingsGoalResponse> {
    return this.http.get<SavingsGoalResponse>(this.apiUrl, {
      withCredentials: true,
    });
  }

  createSavingsGoal(payload: SavingsGoalPayload): Observable<SavingsGoalResponse> {
    return this.http.post<SavingsGoalResponse>(this.apiUrl, payload, {
      withCredentials: true,
    });
  }

  updateSavingsGoal(
    id: string,
    payload: UpdateSavingsGoalPayload,
  ): Observable<SavingsGoalResponse> {
    return this.http.patch<SavingsGoalResponse>(`${this.apiUrl}/${id}`, payload, {
      withCredentials: true,
    });
  }

  deleteSavingsGoal(id: string): Observable<SavingsGoalResponse> {
    return this.http.delete<SavingsGoalResponse>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
