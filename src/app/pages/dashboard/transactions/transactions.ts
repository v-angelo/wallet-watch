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
  LucidePencil,
  LucideTrash2,
} from '@lucide/angular';

import { TransactionData, TransactionService } from '../../../core/services/tansaction.service';
import { HttpErrorResponse } from '@angular/common/http';

type TransactionType = 'income' | 'expense';

type TransactionIcon =
  'food' | 'transport' | 'shopping' | 'housing' | 'salary' | 'health' | 'other';

interface Transaction {
  id: string;
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
    LucideX,
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
    LucidePencil,
    LucideTrash2,
  ],
  templateUrl: './transactions.html',
})
export class Transactions implements OnInit {
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadTransactions();

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

  readonly categories = [
    'Food & Dining',
    'Transport',
    'Shopping',
    'Bills & Utilities',
    'Healthcare',
    'Income',
    'Other',
  ];

  private readonly transactionService = inject(TransactionService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  readonly transactions = signal<Transaction[]>([]);

  private mapTransaction(transaction: TransactionData): Transaction {
    const iconMap: Record<string, TransactionIcon> = {
      'Food & Dining': 'food',
      Transport: 'transport',
      Shopping: 'shopping',
      'Bills & Utilities': 'housing',
      Healthcare: 'health',
      Income: 'salary',
      Salary: 'salary',
      Other: 'other',
    };

    return {
      id: transaction._id,
      title: transaction.title,
      category: transaction.category,
      date: transaction.date.slice(0, 10),
      amount: transaction.amount,
      type: transaction.type,
      icon: iconMap[transaction.category] ?? (transaction.type === 'income' ? 'salary' : 'other'),
    };
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transactionService.getTransactions().subscribe({
      next: (response) => {
        this.transactions.set(response.data.map((transaction) => this.mapTransaction(transaction)));

        this.isLoading.set(false);
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.status === 401
            ? 'Your session has expired. Please log in again.'
            : 'Failed to load transactions. Please try again.',
        );
      },
    });
  }

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
    if (!this.showAddForm()) {
      this.editingTransactionId.set(null);
      this.errorMessage.set('');

      this.newTransaction.set({
        title: '',
        category: 'Food & Dining',
        amount: '',
        type: 'expense',
        date: new Date().toISOString().slice(0, 10),
      });
    }

    this.showAddForm.update((value) => !value);
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
    const editingId = this.editingTransactionId();

    if (
      !form.title.trim() ||
      form.title.trim().length < 2 ||
      form.title.trim().length > 100 ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !form.date ||
      (form.type === 'expense' && !form.category)
    ) {
      this.errorMessage.set('Please enter valid transaction details.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const payload = {
      title: form.title.trim(),
      amount,
      type: form.type,
      category: form.type === 'income' ? 'Income' : form.category,
      date: form.date,
    };

    const request = editingId
      ? this.transactionService.updateTransaction(editingId, payload)
      : this.transactionService.createTransaction(payload);

    request.subscribe({
      next: (response) => {
        const updated = this.mapTransaction(response.data);

        if (editingId) {
          this.transactions.update((items) =>
            items.map((item) => (item.id === editingId ? updated : item)),
          );
        } else {
          this.transactions.update((items) => [updated, ...items]);
        }

        // Show the changed transaction even if it belongs to another month.
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
          date: new Date().toISOString().slice(0, 10),
        });

        this.editingTransactionId.set(null);
        this.showAddForm.set(false);
        this.isSaving.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          error.error?.message ??
            `Failed to ${editingId ? 'update' : 'create'} transaction. Please try again.`,
        );
      },
    });
  }

  readonly editingTransactionId = signal<string | null>(null);

  editTransaction(transaction: Transaction): void {
    this.editingTransactionId.set(transaction.id);

    this.newTransaction.set({
      title: transaction.title,
      category: transaction.category,
      amount: String(transaction.amount),
      type: transaction.type,
      date: transaction.date,
    });

    this.errorMessage.set('');
    this.showAddForm.set(true);
  }

  deleteTransaction(transaction: Transaction): void {
    const confirmed = window.confirm(`Are you sure you want to delete "${transaction.title}"?`);

    if (!confirmed) return;

    this.errorMessage.set('');

    this.transactionService.deleteTransaction(transaction.id).subscribe({
      next: () => {
        this.transactions.update((items) => items.filter((item) => item.id !== transaction.id));

        // Return to the previous page if the current page becomes empty.
        this.currentPage.update((page) => Math.min(page, this.totalPages()));
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.message ?? 'Failed to delete transaction. Please try again.',
        );
      },
    });
  }

  cancelTransactionForm(): void {
    this.showAddForm.set(false);
    this.editingTransactionId.set(null);
    this.errorMessage.set('');

    this.newTransaction.set({
      title: '',
      category: 'Food & Dining',
      amount: '',
      type: 'expense',
      date: new Date().toISOString().slice(0, 10),
    });
  }

  availableMonths = computed(() => {
    const months = new Set<string>();

    // always include the current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    months.add(currentMonth);

    // add months found in the transactions list
    this.transactions().forEach((transaction) => {
      const date = String(transaction.date);
      const match = date.match(/^(\d{4})-(\d{2})/);

      if (match) {
        months.add(`${match[1]}-${match[2]}`);
      }
    });

    // sort newest to oldest and create readable labels
    return Array.from(months)
      .sort((a, b) => b.localeCompare(a))
      .map((value) => {
        const [year, month] = value.split('-').map(Number);

        return {
          value,
          label: new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric',
          }),
        };
      });
  });

  trackTransaction(_index: number, transaction: Transaction): string {
    return transaction.id;
  }
}
