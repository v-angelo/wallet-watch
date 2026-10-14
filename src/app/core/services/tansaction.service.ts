import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TransactionType = 'income' | 'expense';

export interface TransactionData {
  _id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  notes: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank transfer' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  notes?: string;
  paymentMethod?: TransactionData['paymentMethod'];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/transactions`;

  // get all transactions for the logged-in user
  getTransactions(): Observable<ApiResponse<TransactionData[]>> {
    return this.http.get<ApiResponse<TransactionData[]>>(this.apiUrl, { withCredentials: true });
  }

  // create a transaction
  createTransaction(
    transaction: CreateTransactionRequest,
  ): Observable<ApiResponse<TransactionData>> {
    return this.http.post<ApiResponse<TransactionData>>(this.apiUrl, transaction, {
      withCredentials: true,
    });
  }

  // update a transaction
  updateTransaction(
    id: string,
    transaction: CreateTransactionRequest,
  ): Observable<ApiResponse<TransactionData>> {
    return this.http.put<ApiResponse<TransactionData>>(`${this.apiUrl}/${id}`, transaction, {
      withCredentials: true,
    });
  }

  // delete a transaction
  deleteTransaction(id: string): Observable<ApiResponse<TransactionData>> {
    return this.http.delete<ApiResponse<TransactionData>>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
