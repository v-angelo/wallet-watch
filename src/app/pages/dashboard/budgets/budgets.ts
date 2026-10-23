import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  LucideWallet,
  LucideTarget,
  LucideCalendarDays,
  LucidePlus,
  LucidePencil,
  LucideTrash,
  LucideChevronLeft,
  LucideChevronRight,
  LucideRefreshCw,
  LucideX,
  LucideCircleAlert,
  LucideTriangleAlert,
} from '@lucide/angular';

import {
  BudgetService,
  BudgetData,
  BudgetPayload,
  BudgetType,
  BudgetCategory,
  BUDGET_CATEGORIES,
} from '../../../core/services/budget.service';

import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    FormsModule,
    LucideWallet,
    LucideTarget,
    LucideCalendarDays,
    LucidePlus,
    LucidePencil,
    LucideTrash,
    LucideChevronLeft,
    LucideChevronRight,
    LucideRefreshCw,
    LucideX,
    LucideCircleAlert,
    LucideTriangleAlert,
  ],
  templateUrl: './budgets.html',
})
export class Budgets {
  private readonly budgetService = inject(BudgetService);
  private readonly currencyService = inject(CurrencyService);
  private readonly toastService = inject(ToastService);

  readonly categories = BUDGET_CATEGORIES;
  readonly budgets = signal<BudgetData[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isDeleting = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly today = new Date();

  readonly selectedMonth = signal(this.today.getMonth() + 1);
  readonly selectedYear = signal(this.today.getFullYear());

  readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(this.selectedYear(), this.selectedMonth() - 1, 1)),
  );

  readonly overallBudget = computed(
    () => this.budgets().find((budget) => budget.type === 'overall') ?? null,
  );

  readonly categoryBudgets = computed(() =>
    this.budgets()
      .filter((budget) => budget.type === 'category')
      .sort((a, b) => a.category.localeCompare(b.category)),
  );

  readonly totalBudget = computed(() =>
    this.budgets().reduce((total, budget) => total + budget.amount, 0),
  );

  readonly totalSpent = computed(() =>
    this.budgets().reduce((total, budget) => total + (budget.spent ?? 0), 0),
  );

  // count spending only once in the summary:
  // category budgets take priority when available.
  readonly summarySpent = computed(() => {
    const overall = this.overallBudget();

    if (overall) return overall.spent ?? 0;

    return this.categoryBudgets().reduce((total, budget) => total + (budget.spent ?? 0), 0);
  });

  readonly summaryLimit = computed(() => {
    const overall = this.overallBudget();

    if (overall) return overall.amount;

    return this.categoryBudgets().reduce((total, budget) => total + budget.amount, 0);
  });

  readonly summaryRemaining = computed(() => this.summaryLimit() - this.summarySpent());

  readonly summaryPercentage = computed(() => {
    const limit = this.summaryLimit();

    return limit > 0 ? (this.summarySpent() / limit) * 100 : 0;
  });

  readonly isCurrentMonth = computed(
    () =>
      this.selectedMonth() === this.today.getMonth() + 1 &&
      this.selectedYear() === this.today.getFullYear(),
  );

  readonly isFutureMonth = computed(() => {
    return (
      this.selectedYear() > this.today.getFullYear() ||
      (this.selectedYear() === this.today.getFullYear() &&
        this.selectedMonth() > this.today.getMonth() + 1)
    );
  });

  readonly totalCategoryBudget = computed(() =>
    this.categoryBudgets().reduce((total, budget) => total + budget.amount, 0),
  );

  readonly categoryBudgetExceedsOverall = computed(() => {
    const overall = this.overallBudget();

    return !!overall && this.totalCategoryBudget() > overall.amount;
  });

  readonly categoryBudgetExcess = computed(() => {
    const overall = this.overallBudget();

    if (!overall) return 0;

    return Math.max(0, this.totalCategoryBudget() - overall.amount);
  });

  // form state
  readonly isFormOpen = signal(false);
  readonly editingBudgetId = signal<string | null>(null);

  budgetType: BudgetType = 'category';
  selectedCategory: BudgetCategory = 'Food & Dining';
  budgetAmount: number | null = null;

  readonly Math = Math;

  constructor() {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.budgetService.getBudgets(this.selectedMonth(), this.selectedYear()).subscribe({
      next: (response) => {
        this.budgets.set(Array.isArray(response.data) ? response.data : []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load budgets:', error);
        this.errorMessage.set('Unable to load your budgets. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  changeMonth(offset: number): void {
    const date = new Date(this.selectedYear(), this.selectedMonth() - 1 + offset, 1);

    this.selectedMonth.set(date.getMonth() + 1);
    this.selectedYear.set(date.getFullYear());

    this.isFormOpen.set(false);
    this.loadBudgets();
  }

  openCreateForm(type: BudgetType = 'category'): void {
    this.editingBudgetId.set(null);
    this.budgetType = type;
    this.selectedCategory = 'Food & Dining';
    this.budgetAmount = null;
    this.successMessage.set('');
    this.errorMessage.set('');
    this.isFormOpen.set(true);
  }

  openEditForm(budget: BudgetData): void {
    this.editingBudgetId.set(budget._id);
    this.budgetType = budget.type;

    if (budget.type === 'category') {
      this.selectedCategory = budget.category as BudgetCategory;
    }

    this.budgetAmount = budget.amount;
    this.successMessage.set('');
    this.errorMessage.set('');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    if (this.isSaving()) return;

    this.isFormOpen.set(false);
    this.editingBudgetId.set(null);
  }

  saveBudget(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (
      this.budgetAmount === null ||
      !Number.isFinite(this.budgetAmount) ||
      this.budgetAmount <= 0
    ) {
      this.errorMessage.set('Enter a budget amount greater than zero.');
      return;
    }

    if (this.budgetType === 'category' && !this.categories.includes(this.selectedCategory)) {
      this.errorMessage.set('Please select a valid category.');
      return;
    }

    const payload: BudgetPayload = {
      type: this.budgetType,
      category: this.budgetType === 'category' ? this.selectedCategory : undefined,
      amount: this.budgetAmount,
      month: this.selectedMonth(),
      year: this.selectedYear(),
    };

    this.isSaving.set(true);

    const budgetId = this.editingBudgetId();

    const request = budgetId
      ? this.budgetService.updateBudget(budgetId, payload)
      : this.budgetService.createBudget(payload);

    request.subscribe({
      next: (response) => {
        if (budgetId) {
          this.toastService.success(response.message || 'Budget updated successfully!');
        } else {
          this.toastService.success(response.message || 'Budget created successfully!');
        }

        this.isSaving.set(false);
        this.isFormOpen.set(false);
        this.editingBudgetId.set(null);
        this.successMessage.set(response.message);
        this.loadBudgets();
      },
      error: (error) => {
        console.error('Failed to save budget:', error);
        this.isSaving.set(false);
        this.errorMessage.set(
          error.status === 409
            ? 'A budget already exists for this category and month.'
            : (error.error?.message ?? 'Unable to save the budget.'),
        );
      },
    });
  }

  deleteBudget(budget: BudgetData): void {
    const confirmed = window.confirm(
      `Delete the ${budget.type === 'overall' ? 'overall' : budget.category} budget for ${this.monthLabel()}?`,
    );

    if (!confirmed) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isDeleting.set(budget._id);

    this.budgetService.deleteBudget(budget._id).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Budget deleted successfully!');

        this.isDeleting.set(null);
        this.successMessage.set(response.message);
        this.loadBudgets();
      },
      error: (error) => {
        console.error('Failed to delete budget:', error);
        this.isDeleting.set(null);
        this.errorMessage.set('Unable to delete the budget. Please try again.');
      },
    });
  }

  formatCurrency(amount: number): string {
    return this.currencyService.format(amount);
  }

  progressPercentage(budget: BudgetData): number {
    if (budget.amount <= 0) return 0;

    // cap the visual bar at 100%; show the actual percentage in text.
    return Math.min(100, Math.max(0, ((budget.spent ?? 0) / budget.amount) * 100));
  }

  isOverBudget(budget: BudgetData): boolean {
    return (budget.spent ?? 0) > budget.amount;
  }

  isNearLimit(budget: BudgetData): boolean {
    return !this.isOverBudget(budget) && this.progressPercentage(budget) >= 80;
  }

  trackBudget(_index: number, budget: BudgetData): string {
    return budget._id;
  }
}
