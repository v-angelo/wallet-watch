import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  LucideWallet,
  LucideTrendingUp,
  LucideTrendingDown,
  LucideArrowUpRight,
  LucideArrowDownRight,
  LucideSearch,
  LucideSlidersHorizontal,
  LucideCalendarDays,
  LucidePlus,
  LucideChevronLeft,
  LucideChevronRight,
  LucideX,
  LucideUtensils,
  LucideCarFront,
  LucideShoppingBag,
  LucideHouse,
  LucideBriefcaseBusiness,
  LucideHeartPulse,
  LucideCircleDollarSign,
} from '@lucide/angular';

type TransactionType = 'income' | 'expense';

type TransactionIcon =
  'food' | 'transport' | 'shopping' | 'housing' | 'salary' | 'health' | 'other';

interface Transaction {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: TransactionType;
  icon: TransactionIcon;
}

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [
    LucideWallet,
    LucideTrendingUp,
    LucideTrendingDown,
    LucideArrowUpRight,
    LucideArrowDownRight,
    LucideSearch,
    LucideSlidersHorizontal,
    LucideCalendarDays,
    LucidePlus,
    LucideChevronLeft,
    LucideChevronRight,
    LucideX,
    LucideUtensils,
    LucideCarFront,
    LucideShoppingBag,
    LucideHouse,
    LucideBriefcaseBusiness,
    LucideHeartPulse,
    LucideCircleDollarSign,
  ],
  templateUrl: './transactions.html',
})
export class Transactions implements OnInit {
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('action') === 'new') {
        this.showAddForm.set(true);
      }
    });
  }

  readonly currentDate = new Date();

  readonly currentMonth = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
  }).format(this.currentDate);

  readonly monthLabel = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(this.currentDate);

  readonly searchTerm = signal('');
  readonly selectedType = signal('all');
  readonly selectedCategory = signal('all');
  readonly selectedMonth = signal(this.currentMonth);
  readonly currentPage = signal(1);
  readonly pageSize = 6;
  readonly showAddForm = signal(false);

  readonly newTransaction = signal({
    title: '',
    category: 'Food & Dining',
    amount: '',
    type: 'expense' as TransactionType,
    date: this.currentDate.toISOString().slice(0, 10),
  });

  readonly transactions = signal<Transaction[]>([
    {
      id: 1,
      title: 'Monthly groceries',
      category: 'Food & Dining',
      date: '2026-10-12',
      amount: 850,
      type: 'expense',
      icon: 'food',
    },
    {
      id: 2,
      title: 'Fuel',
      category: 'Transport',
      date: '2026-10-11',
      amount: 1500,
      type: 'expense',
      icon: 'transport',
    },
    {
      id: 3,
      title: 'Monthly salary',
      category: 'Income',
      date: '2026-10-01',
      amount: 35000,
      type: 'income',
      icon: 'salary',
    },
    {
      id: 4,
      title: 'Online shopping',
      category: 'Shopping',
      date: '2026-09-29',
      amount: 1800,
      type: 'expense',
      icon: 'shopping',
    },
    {
      id: 5,
      title: 'Electricity bill',
      category: 'Bills & Utilities',
      date: '2026-09-27',
      amount: 1200,
      type: 'expense',
      icon: 'housing',
    },
    {
      id: 6,
      title: 'Freelance payment',
      category: 'Income',
      date: '2026-09-25',
      amount: 8000,
      type: 'income',
      icon: 'salary',
    },
    {
      id: 7,
      title: 'Restaurant dinner',
      category: 'Food & Dining',
      date: '2026-09-22',
      amount: 650,
      type: 'expense',
      icon: 'food',
    },
    {
      id: 8,
      title: 'Doctor appointment',
      category: 'Healthcare',
      date: '2026-09-18',
      amount: 900,
      type: 'expense',
      icon: 'health',
    },
    {
      id: 9,
      title: 'Rent',
      category: 'Bills & Utilities',
      date: '2026-09-05',
      amount: 7000,
      type: 'expense',
      icon: 'housing',
    },
    {
      id: 10,
      title: 'Bus pass',
      category: 'Transport',
      date: '2026-08-28',
      amount: 600,
      type: 'expense',
      icon: 'transport',
    },
  ]);

  readonly categories = [
    'Food & Dining',
    'Transport',
    'Shopping',
    'Bills & Utilities',
    'Healthcare',
    'Income',
    'Other',
  ];

  readonly filteredTransactions = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const type = this.selectedType();
    const category = this.selectedCategory();
    const month = this.selectedMonth();

    return this.transactions()
      .filter((transaction) => {
        const matchesSearch =
          !search ||
          transaction.title.toLowerCase().includes(search) ||
          transaction.category.toLowerCase().includes(search);

        const matchesType = type === 'all' || transaction.type === type;

        const matchesCategory = category === 'all' || transaction.category === category;

        const matchesMonth = month === 'all' || transaction.date.startsWith(month);

        return matchesSearch && matchesType && matchesCategory && matchesMonth;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  readonly totalIncome = computed(() =>
    this.filteredTransactions()
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0),
  );

  readonly totalExpenses = computed(() =>
    this.filteredTransactions()
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0),
  );

  readonly netTotal = computed(() => this.totalIncome() - this.totalExpenses());

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTransactions().length / this.pageSize)),
  );

  readonly paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;

    return this.filteredTransactions().slice(start, start + this.pageSize);
  });

  readonly startItem = computed(() =>
    this.filteredTransactions().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1,
  );

  readonly endItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.filteredTransactions().length),
  );

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onTypeChange(value: string): void {
    this.selectedType.set(value);
    this.currentPage.set(1);
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
    this.currentPage.set(1);
  }

  onMonthChange(value: string): void {
    this.selectedMonth.set(value);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set('all');
    this.selectedCategory.set('all');
    this.selectedMonth.set('all');
    this.currentPage.set(1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  toggleAddForm(): void {
    this.showAddForm.update((visible) => !visible);
  }

  updateNewTransaction(
    field: 'title' | 'category' | 'amount' | 'type' | 'date',
    value: string,
  ): void {
    this.newTransaction.update((transaction) => ({
      ...transaction,
      [field]: value,
    }));
  }

  addTransaction(): void {
    const form = this.newTransaction();
    const amount = Number(form.amount);

    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0 || !form.date) {
      return;
    }

    const iconMap: Record<string, TransactionIcon> = {
      'Food & Dining': 'food',
      Transport: 'transport',
      Shopping: 'shopping',
      'Bills & Utilities': 'housing',
      Healthcare: 'health',
      Income: 'salary',
      Other: 'other',
    };

    const transaction: Transaction = {
      id: Math.max(0, ...this.transactions().map((item) => item.id)) + 1,
      title: form.title.trim(),
      category: form.type === 'income' ? 'Income' : form.category,
      date: form.date,
      amount,
      type: form.type,
      icon: form.type === 'income' ? 'salary' : (iconMap[form.category] ?? 'other'),
    };

    this.transactions.update((items) => [transaction, ...items]);
    this.selectedMonth.set('all');
    this.selectedType.set('all');
    this.selectedCategory.set('all');
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.newTransaction.set({
      title: '',
      category: 'Food & Dining',
      amount: '',
      type: 'expense',
      date: this.currentDate.toISOString().slice(0, 10),
    });
    this.showAddForm.set(false);
  }

  trackTransaction(_index: number, transaction: Transaction): number {
    return transaction.id;
  }
}
