import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  LucideWallet,
  LucideTrendingUp,
  LucideTrendingDown,
  LucidePiggyBank,
  LucideCalendarDays,
  LucideArrowUpRight,
  LucideArrowDownRight,
  LucideUtensils,
  LucideCarFront,
  LucideShoppingBag,
  LucideHouse,
  LucideArrowRight,
} from '@lucide/angular';

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
  budget: number;
  color: string;
}

interface RecentTransaction {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  icon: 'food' | 'transport' | 'shopping' | 'housing';
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    LucideWallet,
    LucideTrendingUp,
    LucideTrendingDown,
    LucidePiggyBank,
    LucideCalendarDays,
    LucideArrowUpRight,
    LucideArrowDownRight,
    LucideUtensils,
    LucideCarFront,
    LucideShoppingBag,
    LucideHouse,
    LucideArrowRight,
  ],
  templateUrl: './overview.html',
})
export class Overview {
  readonly currentDate = new Date();
  readonly Math = Math;

  readonly monthLabel = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(this.currentDate);

  // mock financial data
  readonly monthlyIncome = 35000;
  readonly monthlyExpenses = 12400;
  readonly netSavings = this.monthlyIncome - this.monthlyExpenses;

  // summary cards
  readonly summaryCards = signal<SummaryCard[]>([
    {
      title: 'Total Balance',
      amount: 48250,
      description: 'Across tracked accounts',
      type: 'balance',
    },
    {
      title: 'Income',
      amount: 35000,
      description: 'Received this month',
      trend: 8.2,
      trendLabel: 'vs. last month',
      type: 'income',
    },
    {
      title: 'Expenses',
      amount: 12400,
      description: 'Spent this month',
      trend: 12.5,
      trendLabel: 'vs. last month',
      type: 'expense',
    },
    {
      title: 'Net Savings',
      amount: this.netSavings,
      description: 'Income minus expenses',
      type: 'savings',
    },
  ]);

  // last six months of cash flow
  readonly cashFlow = signal<MonthlyCashFlow[]>([
    { month: 'May', income: 28000, expenses: 18000 },
    { month: 'Jun', income: 32000, expenses: 21000 },
    { month: 'Jul', income: 30000, expenses: 19500 },
    { month: 'Aug', income: 35000, expenses: 22000 },
    { month: 'Sep', income: 33000, expenses: 16000 },
    { month: 'Oct', income: 35000, expenses: 12400 },
  ]);

  readonly maxCashFlow = computed(() =>
    Math.max(1, ...this.cashFlow().flatMap((item) => [item.income, item.expenses])),
  );

  // mock spending breakdown
  readonly spendingCategories = signal<SpendingCategory[]>([
    {
      name: 'Food & Dining',
      amount: 4200,
      budget: 6000,
      color: 'bg-(--accent)',
    },
    {
      name: 'Transport',
      amount: 2100,
      budget: 4000,
      color: 'bg-(--success)',
    },
    {
      name: 'Shopping',
      amount: 1800,
      budget: 3000,
      color: 'bg-[#8b83d7]',
    },
    {
      name: 'Bills & Utilities',
      amount: 2500,
      budget: 4000,
      color: 'bg-[#d99a64]',
    },
  ]);

  // mock recent transactions
  readonly recentTransactions = signal<RecentTransaction[]>([
    {
      id: 1,
      title: 'Monthly groceries',
      category: 'Food & Dining',
      date: 'Oct 12, 2026',
      amount: 850,
      type: 'expense',
      icon: 'food',
    },
    {
      id: 2,
      title: 'Fuel',
      category: 'Transport',
      date: 'Oct 11, 2026',
      amount: 1500,
      type: 'expense',
      icon: 'transport',
    },
    {
      id: 3,
      title: 'Monthly salary',
      category: 'Income',
      date: 'Oct 01, 2026',
      amount: 35000,
      type: 'income',
      icon: 'housing',
    },
    {
      id: 4,
      title: 'Online shopping',
      category: 'Shopping',
      date: 'Sep 29, 2026',
      amount: 1800,
      type: 'expense',
      icon: 'shopping',
    },
    {
      id: 5,
      title: 'Electricity bill',
      category: 'Bills & Utilities',
      date: 'Sep 27, 2026',
      amount: 1200,
      type: 'expense',
      icon: 'housing',
    },
  ]);

  readonly totalBudget = computed(() =>
    this.spendingCategories().reduce((total, category) => total + category.budget, 0),
  );

  readonly totalCategorySpending = computed(() =>
    this.spendingCategories().reduce((total, category) => total + category.amount, 0),
  );

  readonly budgetUsed = computed(() => {
    const budget = this.totalBudget();

    return budget > 0 ? Math.round((this.totalCategorySpending() / budget) * 100) : 0;
  });

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  barHeight(amount: number): number {
    return (amount / this.maxCashFlow()) * 100;
  }

  categoryPercentage(category: SpendingCategory): number {
    return category.budget > 0 ? Math.min((category.amount / category.budget) * 100, 100) : 0;
  }

  trackTransaction(_index: number, transaction: RecentTransaction): number {
    return transaction.id;
  }

  private readonly router = inject(Router);

  openNewTransaction(): void {
    this.router.navigate(['/dashboard/transactions'], {
      queryParams: { action: 'new' },
    });
  }
}
