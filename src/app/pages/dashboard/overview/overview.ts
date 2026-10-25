import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  LucideWallet,
  LucideTrendingUp,
  LucideTrendingDown,
  LucidePiggyBank,
  LucideArrowUpRight,
  LucideArrowDownRight,
  LucideUtensils,
  LucideCarFront,
  LucideShoppingBag,
  LucideHouse,
  LucideArrowRight,
} from '@lucide/angular';
import { TransactionData, TransactionService } from '../../../core/services/tansaction.service';
import { CurrencyService } from '../../../core/services/currency.service';

interface SummaryCard {
  title: string;
  amount: number;
  description: string;
  trend?: number;
  trendLabel?: string;
  type: 'balance' | 'income' | 'expense' | 'savings';
}

interface MonthlyCashFlow {
  month: string;
  income: number;
  expenses: number;
}

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

type CategoryIcon = 'food' | 'transport' | 'shopping' | 'housing';

interface RecentTransaction {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  icon: CategoryIcon;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    LucideWallet,
    LucideTrendingUp,
    LucideTrendingDown,
    LucidePiggyBank,
    LucideArrowUpRight,
    LucideArrowDownRight,
    LucideUtensils,
    LucideCarFront,
    LucideShoppingBag,
    LucideHouse,
    LucideArrowRight,
    RouterLink,
  ],
  templateUrl: './overview.html',
})
export class Overview {
  private readonly router = inject(Router);
  private readonly transactionService = inject(TransactionService);
  private readonly currencyService = inject(CurrencyService);

  readonly currentDate = new Date();
  readonly Math = Math;

  readonly monthLabel = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(this.currentDate);

  readonly currentMonthShort = new Intl.DateTimeFormat('en-IN', {
    month: 'short',
  }).format(this.currentDate);

  readonly transactions = signal<TransactionData[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  // date helpers
  private readonly currentMonthKey = this.getMonthKey(this.currentDate);

  private getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private parseTransactionDate(value: string): Date {
    // parse date-only strings as local dates to avoid timezone shifts.
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    return new Date(value);
  }

  private isInCurrentMonth(transaction: TransactionData): boolean {
    const date = this.parseTransactionDate(transaction.date);

    return !Number.isNaN(date.getTime()) && this.getMonthKey(date) === this.currentMonthKey;
  }

  private getAmount(transactions: TransactionData[], type: 'income' | 'expense'): number {
    return transactions
      .filter((transaction) => transaction.type === type)
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  }

  // transactions for the current month
  readonly currentMonthTransactions = computed(() =>
    this.transactions().filter((transaction) => this.isInCurrentMonth(transaction)),
  );

  readonly monthlyIncome = computed(() =>
    this.getAmount(this.currentMonthTransactions(), 'income'),
  );

  readonly monthlyExpenses = computed(() =>
    this.getAmount(this.currentMonthTransactions(), 'expense'),
  );

  readonly netSavings = computed(() => this.monthlyIncome() - this.monthlyExpenses());

  // all-time income and expenses
  readonly totalIncome = computed(() => this.getAmount(this.transactions(), 'income'));

  readonly totalExpenses = computed(() => this.getAmount(this.transactions(), 'expense'));

  // all-time net transaction total
  readonly netTransactionTotal = computed(() => this.totalIncome() - this.totalExpenses());

  readonly summaryCards = computed<SummaryCard[]>(() => [
    {
      title: 'Net Transaction Total',
      amount: this.netTransactionTotal(),
      description: 'All recorded income minus expenses',
      type: 'balance',
    },
    {
      title: 'Total Income',
      amount: this.totalIncome(),
      description: 'Across all recorded transactions',
      type: 'income',
    },
    {
      title: 'Total Expenses',
      amount: this.totalExpenses(),
      description: 'Across all recorded transactions',
      type: 'expense',
    },
    {
      title: 'Net Savings',
      amount: this.netSavings(),
      description: 'Income minus expenses this month',
      type: 'savings',
    },
  ]);

  // last six calendar months, including the current month
  readonly cashFlow = computed<MonthlyCashFlow[]>(() => {
    const now = this.currentDate;

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);

      const monthKey = this.getMonthKey(date);

      const monthTransactions = this.transactions().filter((transaction) => {
        const transactionDate = this.parseTransactionDate(transaction.date);

        return (
          !Number.isNaN(transactionDate.getTime()) && this.getMonthKey(transactionDate) === monthKey
        );
      });

      return {
        month: new Intl.DateTimeFormat('en-IN', {
          month: 'short',
        }).format(date),
        income: this.getAmount(monthTransactions, 'income'),
        expenses: this.getAmount(monthTransactions, 'expense'),
      };
    });
  });

  // only months with at least one income or expense transaction
  readonly activeCashFlowMonths = computed(() =>
    this.cashFlow().filter((month) => month.income > 0 || month.expenses > 0),
  );

  // average income across months with transaction activity
  readonly averageMonthlyIncome = computed(() => {
    const months = this.activeCashFlowMonths();

    if (months.length === 0) return 0;

    return months.reduce((total, month) => total + month.income, 0) / months.length;
  });

  // average expenses across months with transaction activity
  readonly averageMonthlyExpenses = computed(() => {
    const months = this.activeCashFlowMonths();

    if (months.length === 0) return 0;

    return months.reduce((total, month) => total + month.expenses, 0) / months.length;
  });

  readonly maxCashFlow = computed(() =>
    Math.max(1, ...this.cashFlow().flatMap((item) => [item.income, item.expenses])),
  );

  // current-month expense breakdown by category
  readonly spendingCategories = computed<SpendingCategory[]>(() => {
    const totals = new Map<string, number>();

    for (const transaction of this.currentMonthTransactions()) {
      if (transaction.type !== 'expense') continue;

      const category = transaction.category || 'Other';

      totals.set(category, (totals.get(category) ?? 0) + Number(transaction.amount || 0));
    }

    const colors: Record<string, string> = {
      'Food & Dining': 'bg-(--accent)',
      Transport: 'bg-(--success)',
      Shopping: 'bg-[#8b83d7]',
      'Bills & Utilities': 'bg-[#d99a64]',
      Healthcare: 'bg-[#d77991]',
      Income: 'bg-(--success)',
      Other: 'bg-(--text-secondary)',
    };

    return Array.from(totals, ([name, amount]) => ({
      name,
      amount,
      color: colors[name] ?? 'bg-(--text-secondary)',
    })).sort((a, b) => b.amount - a.amount);
  });

  readonly totalCategorySpending = computed(() =>
    this.spendingCategories().reduce((total, category) => total + category.amount, 0),
  );

  // share of total category spending
  categoryPercentage(category: SpendingCategory): number {
    const total = this.totalCategorySpending();

    return total > 0 ? (category.amount / total) * 100 : 0;
  }

  // five most recent transactions
  readonly recentTransactions = computed<RecentTransaction[]>(() =>
    [...this.transactions()]
      .sort((a, b) => {
        const dateDifference =
          this.parseTransactionDate(b.date).getTime() - this.parseTransactionDate(a.date).getTime();

        if (dateDifference !== 0) return dateDifference;

        // use creation time as a tie-breaker for transactions on the same day.
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5)
      .map((transaction) => ({
        id: transaction._id,
        title: transaction.title,
        category: transaction.category || 'Other',
        date: this.formatDate(transaction.date),
        amount: Number(transaction.amount || 0),
        type: transaction.type,
        icon: this.getCategoryIcon(transaction.category),
      })),
  );

  private getCategoryIcon(category: string): CategoryIcon {
    switch (category) {
      case 'Food & Dining':
        return 'food';

      case 'Transport':
        return 'transport';

      case 'Shopping':
        return 'shopping';

      default:
        return 'housing';
    }
  }

  private formatDate(value: string): string {
    const date = this.parseTransactionDate(value);

    if (Number.isNaN(date.getTime())) return 'Unknown date';

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  formatCurrency(amount: number): string {
    return this.currencyService.format(amount);
  }

  barHeight(amount: number): number {
    return (amount / this.maxCashFlow()) * 100;
  }

  trackTransaction(_index: number, transaction: RecentTransaction): string {
    return transaction.id;
  }

  constructor() {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transactionService.getTransactions().subscribe({
      next: (response) => {
        this.transactions.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load overview transactions:', error);
        this.errorMessage.set('Unable to load your financial data. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  openNewTransaction(): void {
    this.router.navigate(['/dashboard/transactions'], {
      queryParams: { action: 'new' },
    });
  }
}
