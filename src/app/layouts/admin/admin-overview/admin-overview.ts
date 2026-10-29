import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  LucideUsers,
  LucideUserCheck,
  LucideUserX,
  LucideArrowLeftRight,
  LucideWallet,
  LucidePiggyBank,
  LucideArrowUpRight,
  LucideRefreshCw,
  LucideShieldCheck,
  LucideActivity,
  LucideCircleAlert,
  LucideChartNoAxesCombined,
} from '@lucide/angular';

import { AdminService, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [
    RouterLink,
    LucideUsers,
    LucideUserCheck,
    LucideUserX,
    LucideArrowLeftRight,
    LucideWallet,
    LucidePiggyBank,
    LucideArrowUpRight,
    LucideRefreshCw,
    LucideShieldCheck,
    LucideActivity,
    LucideCircleAlert,
    LucideChartNoAxesCombined,
  ],
  templateUrl: './admin-overview.html',
})
export class AdminOverview implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly stats = signal<AdminStats | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly activeUserPercentage = computed(() => {
    const data = this.stats();

    if (!data || data.totalUsers === 0) {
      return 0;
    }

    return Math.round((data.activeUsers / data.totalUsers) * 100);
  });

  readonly inactiveUserPercentage = computed(() => {
    const data = this.stats();

    if (!data || data.totalUsers === 0) {
      return 0;
    }

    return Math.round((data.inactiveUsers / data.totalUsers) * 100);
  });

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getAdminStats().subscribe({
      next: (response) => {
        this.stats.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load admin statistics:', error);

        this.errorMessage.set(
          error.error?.message ?? 'Unable to load admin statistics. Please try again.',
        );

        this.isLoading.set(false);
      },
    });
  }
}
