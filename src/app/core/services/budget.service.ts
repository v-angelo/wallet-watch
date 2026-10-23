import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type BudgetType = 'overall' | 'category';

export const BUDGET_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Healthcare',
  'Other',
] as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export interface BudgetPayload {
  type: BudgetType;
  category?: BudgetCategory;
  amount: number;
  month: number;
  year: number;
}

export interface BudgetData {
  _id: string;
  user: string;
  type: BudgetType;
  category: string;
  amount: number;
  month: number;
  year: number;
  spent?: number;
  remaining?: number;
  percentageUsed?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetResponse {
  success: boolean;
  message: string;
  count?: number;
  data: BudgetData | BudgetData[];
}

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/budgets`;

  getBudgets(month: number, year: number): Observable<BudgetResponse> {
    return this.http.get<BudgetResponse>(this.apiUrl, {
      params: {
        month: month.toString(),
        year: year.toString(),
      },
      withCredentials: true,
    });
  }

  createBudget(payload: BudgetPayload): Observable<BudgetResponse> {
    return this.http.post<BudgetResponse>(this.apiUrl, payload, {
      withCredentials: true,
    });
  }

  updateBudget(id: string, payload: BudgetPayload): Observable<BudgetResponse> {
    return this.http.put<BudgetResponse>(`${this.apiUrl}/${id}`, payload, {
      withCredentials: true,
    });
  }

  deleteBudget(id: string): Observable<BudgetResponse> {
    return this.http.delete<BudgetResponse>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
