import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private authService = inject(AuthService);

  // get currency symbol
  getSymbol(): string {
    const currency = this.authService.user()?.currency || 'USD';

    try {
      return (
        new Intl.NumberFormat('en', {
          style: 'currency',
          currency,
          currencyDisplay: 'narrowSymbol',
        })
          .formatToParts(0)
          .find((part) => part.type === 'currency')?.value ?? currency
      );
    } catch {
      return currency;
    }
  }

  // format an amount using the authenticated user's preferred currency
  format(amount: number): string {
    const currency = this.authService.user()?.currency || 'USD';

    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
      }).format(amount);
    } catch {
      // fallback if the saved currency code is invalid
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }
  }
}
