import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  LucidePiggyBank,
  LucideTarget,
  LucideCalendarDays,
  LucidePlus,
  LucidePencil,
  LucideTrash,
  LucideRefreshCw,
  LucideX,
  LucideCircleAlert,
  LucideTrendingUp,
  LucideWallet,
  LucideCircleCheck,
  LucideHouse,
  LucideCarFront,
  LucidePlane,
  LucideGraduationCap,
  LucideLaptop,
  LucideHeart,
  LucideShieldCheck,
  LucideGem,
} from '@lucide/angular';

import {
  SavingsGoalService,
  SavingsGoalData,
  SavingsGoalPayload,
  UpdateSavingsGoalPayload,
} from '../../../core/services/savings-goal.service';

import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-savings-goals',
  standalone: true,
  imports: [
    FormsModule,
    LucidePiggyBank,
    LucideTarget,
    LucideCalendarDays,
    LucidePlus,
    LucidePencil,
    LucideTrash,
    LucideRefreshCw,
    LucideX,
    LucideCircleAlert,
    LucideCircleCheck,
    LucideTrendingUp,
    LucideWallet,
    LucideHouse,
    LucideCarFront,
    LucidePlane,
    LucideGraduationCap,
    LucideLaptop,
    LucideHeart,
    LucideShieldCheck,
    LucideGem,
  ],
  templateUrl: './savings-goals.html',
})
export class SavingsGoals {
  private readonly savingsGoalService = inject(SavingsGoalService);
  private readonly currencyService = inject(CurrencyService);
  private readonly toastService = inject(ToastService);

  readonly goals = signal<SavingsGoalData[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isDeleting = signal<string | null>(null);
  readonly isAddingSavings = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly goalIcons = [
    { name: 'piggy-bank', label: 'Savings', icon: LucidePiggyBank },
    { name: 'house', label: 'Home', icon: LucideHouse },
    { name: 'car-front', label: 'Car', icon: LucideCarFront },
    { name: 'plane', label: 'Travel', icon: LucidePlane },
    { name: 'graduation-cap', label: 'Education', icon: LucideGraduationCap },
    { name: 'laptop', label: 'Tech', icon: LucideLaptop },
    { name: 'heart', label: 'Health', icon: LucideHeart },
    { name: 'shield-check', label: 'Emergency', icon: LucideShieldCheck },
    { name: 'gem', label: 'Special', icon: LucideGem },
    { name: 'wallet', label: 'General', icon: LucideWallet },
  ] as const;

  selectedIcon = 'piggy-bank';

  // summary values
  readonly activeGoals = computed(() => this.goals().filter((goal) => goal.status === 'active'));

  readonly completedGoals = computed(() =>
    this.goals().filter((goal) => goal.status === 'completed'),
  );

  readonly totalTarget = computed(() =>
    this.goals().reduce((total, goal) => total + goal.targetAmount, 0),
  );

  readonly totalSaved = computed(() =>
    this.goals().reduce((total, goal) => total + goal.savedAmount, 0),
  );

  readonly overallProgress = computed(() => {
    const target = this.totalTarget();

    return target > 0 ? Math.min(100, (this.totalSaved() / target) * 100) : 0;
  });

  // goal form state
  readonly isFormOpen = signal(false);
  readonly editingGoalId = signal<string | null>(null);

  goalName = '';
  goalDescription = '';
  targetAmount: number | null = null;
  initialSavedAmount: number | null = 0;
  goalDeadline = '';

  // contribution form state
  readonly isContributionFormOpen = signal(false);
  readonly contributingGoal = signal<SavingsGoalData | null>(null);
  contributionAmount: number | null = null;

  readonly Math = Math;

  constructor() {
    this.loadGoals();
  }

  loadGoals(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.savingsGoalService.getSavingsGoals().subscribe({
      next: (response) => {
        this.goals.set(Array.isArray(response.data) ? response.data : []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load savings goals:', error);
        this.errorMessage.set(
          error.error?.message ?? 'Unable to load your savings goals. Please try again.',
        );
        this.isLoading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingGoalId.set(null);
    this.goalName = '';
    this.goalDescription = '';
    this.targetAmount = null;
    this.initialSavedAmount = 0;
    this.goalDeadline = '';
    this.selectedIcon = 'piggy-bank';

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isFormOpen.set(true);
  }

  openEditForm(goal: SavingsGoalData): void {
    this.editingGoalId.set(goal._id);
    this.goalName = goal.name;
    this.goalDescription = goal.description ?? '';
    this.targetAmount = goal.targetAmount;
    this.initialSavedAmount = goal.savedAmount;
    this.goalDeadline = goal.deadline ? goal.deadline.slice(0, 10) : '';
    this.selectedIcon = goal.icon || 'piggy-bank';

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    if (this.isSaving()) return;

    this.isFormOpen.set(false);
    this.editingGoalId.set(null);
    this.errorMessage.set('');
  }

  saveGoal(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const name = this.goalName.trim();
    const description = this.goalDescription.trim();
    const target = this.targetAmount;
    const saved = this.initialSavedAmount ?? 0;

    if (name.length < 2 || name.length > 60) {
      this.errorMessage.set('The goal name must be between 2 and 60 characters.');
      return;
    }

    if (target === null || !Number.isFinite(target) || target <= 0) {
      this.errorMessage.set('Enter a target amount greater than zero.');
      return;
    }

    if (description.length > 250) {
      this.errorMessage.set('The description cannot exceed 250 characters.');
      return;
    }

    if (!Number.isFinite(saved) || saved < 0 || saved > target) {
      this.errorMessage.set('The saved amount must be between zero and the target amount.');
      return;
    }

    const deadline = this.goalDeadline
      ? new Date(`${this.goalDeadline}T12:00:00`).toISOString()
      : null;

    const payload: SavingsGoalPayload = {
      name,
      description,
      targetAmount: target,
      deadline,
      icon: this.selectedIcon,
    };

    const goalId = this.editingGoalId();

    // only include savedAmount when creating a new goal.
    // existing savings are managed through the contribution form.
    const request = goalId
      ? this.savingsGoalService.updateSavingsGoal(goalId, payload as UpdateSavingsGoalPayload)
      : this.savingsGoalService.createSavingsGoal({
          ...payload,
          savedAmount: saved,
        });

    this.isSaving.set(true);

    request.subscribe({
      next: (response) => {
        this.toastService.success(
          response.message ||
            (goalId ? 'Savings goal updated successfully!' : 'Savings goal created successfully!'),
        );

        this.isSaving.set(false);
        this.isFormOpen.set(false);
        this.editingGoalId.set(null);
        this.successMessage.set(response.message);
        this.loadGoals();
      },
      error: (error) => {
        console.error('Failed to save savings goal:', error);

        this.isSaving.set(false);
        this.errorMessage.set(error.error?.message ?? 'Unable to save the savings goal.');
      },
    });
  }

  openContributionForm(goal: SavingsGoalData): void {
    this.contributingGoal.set(goal);
    this.contributionAmount = null;
    this.errorMessage.set('');
    this.isContributionFormOpen.set(true);
  }

  closeContributionForm(): void {
    if (this.isAddingSavings()) return;

    this.isContributionFormOpen.set(false);
    this.contributingGoal.set(null);
    this.contributionAmount = null;
    this.errorMessage.set('');
  }

  addSavings(): void {
    const goal = this.contributingGoal();
    const amount = this.contributionAmount;

    this.errorMessage.set('');

    if (!goal) return;

    if (amount === null || !Number.isFinite(amount) || amount <= 0) {
      this.errorMessage.set('Enter an amount greater than zero.');
      return;
    }

    const newSavedAmount = goal.savedAmount + amount;

    if (newSavedAmount > goal.targetAmount) {
      this.errorMessage.set(
        `You can add up to ${this.formatCurrency(
          goal.targetAmount - goal.savedAmount,
        )} to reach this goal.`,
      );
      return;
    }

    this.isAddingSavings.set(true);

    this.savingsGoalService
      .updateSavingsGoal(goal._id, {
        savedAmount: newSavedAmount,
      })
      .subscribe({
        next: (response) => {
          this.toastService.success(response.message || 'Savings added successfully!');

          this.isAddingSavings.set(false);
          this.isContributionFormOpen.set(false);
          this.contributingGoal.set(null);
          this.contributionAmount = null;
          this.successMessage.set(response.message);
          this.loadGoals();
        },
        error: (error) => {
          console.error('Failed to add savings:', error);

          this.isAddingSavings.set(false);
          this.errorMessage.set(error.error?.message ?? 'Unable to add savings.');
        },
      });
  }

  deleteGoal(goal: SavingsGoalData): void {
    const confirmed = window.confirm(
      `Delete "${goal.name}"? This will remove the goal from your savings goals list.`,
    );

    if (!confirmed) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isDeleting.set(goal._id);

    this.savingsGoalService.deleteSavingsGoal(goal._id).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Savings goal deleted successfully!');

        this.isDeleting.set(null);
        this.successMessage.set(response.message);
        this.loadGoals();
      },
      error: (error) => {
        console.error('Failed to delete savings goal:', error);

        this.isDeleting.set(null);
        this.errorMessage.set(
          error.error?.message ?? 'Unable to delete the savings goal. Please try again.',
        );
      },
    });
  }

  formatCurrency(amount: number): string {
    return this.currencyService.format(amount);
  }

  progressPercentage(goal: SavingsGoalData): number {
    if (goal.targetAmount <= 0) return 0;

    return Math.min(100, Math.max(0, (goal.savedAmount / goal.targetAmount) * 100));
  }

  remainingAmount(goal: SavingsGoalData): number {
    return Math.max(0, goal.targetAmount - goal.savedAmount);
  }

  daysRemaining(goal: SavingsGoalData): number | null {
    if (!goal.deadline) return null;

    const deadline = new Date(goal.deadline);
    const today = new Date();

    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatDeadline(deadline: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(deadline));
  }

  trackGoal(_index: number, goal: SavingsGoalData): string {
    return goal._id;
  }
}
