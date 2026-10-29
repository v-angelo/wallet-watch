import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideSearch,
  LucideRefreshCw,
  LucideUsers,
  LucideUserCheck,
  LucideUserX,
  LucideShieldCheck,
  LucideMail,
  LucideCalendarDays,
  LucideChevronLeft,
  LucideChevronRight,
  LucideCheck,
  LucideX,
  LucideCircleAlert,
  LucideLoaderCircle,
  LucideUserRound,
  LucideTrash,
} from '@lucide/angular';

import { AdminService, AdminUser, UserStatusFilter } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    FormsModule,
    LucideSearch,
    LucideRefreshCw,
    LucideUsers,
    LucideUserCheck,
    LucideUserX,
    LucideShieldCheck,
    LucideMail,
    LucideCalendarDays,
    LucideChevronLeft,
    LucideChevronRight,
    LucideTrash,
    LucideCheck,
    LucideX,
    LucideCircleAlert,
    LucideLoaderCircle,
    LucideUserRound,
    NgClass,
  ],
  templateUrl: './admin-users.html',
})
export class AdminUsers implements OnInit {
  private readonly adminService = inject(AdminService);
  readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly users = signal<AdminUser[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly searchTerm = signal('');
  readonly statusFilter = signal<UserStatusFilter>('all');

  readonly currentPage = signal(1);
  readonly pageSize = 10;
  readonly totalUsers = signal(0);
  readonly totalPages = signal(1);

  readonly updatingUserId = signal<string | null>(null);
  readonly deletingUserId = signal<string | null>(null);
  readonly userToDelete = signal<AdminUser | null>(null);

  readonly activeCount = computed(() => this.users().filter((user) => user.isActive).length);

  readonly inactiveCount = computed(() => this.users().filter((user) => !user.isActive).length);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService
      .getAllUsers({
        search: this.searchTerm(),
        status: this.statusFilter(),
        page: this.currentPage(),
        limit: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.users.set(response.data.users);
          this.totalUsers.set(response.data.pagination.totalUsers);
          this.totalPages.set(Math.max(1, response.data.pagination.totalPages));
          this.currentPage.set(response.data.pagination.currentPage);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load users:', error);
          this.errorMessage.set(error.error?.message ?? 'Unable to load users. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value as UserStatusFilter);
    this.currentPage.set(1);
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.loadUsers();
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  isCurrentUser(user: AdminUser): boolean {
    return user._id === this.authService.user()?._id;
  }

  toggleUserStatus(user: AdminUser): void {
    if (this.isCurrentUser(user) || this.updatingUserId()) {
      return;
    }

    const nextStatus = !user.isActive;

    this.updatingUserId.set(user._id);

    this.adminService.updateUserStatus(user._id, { isActive: nextStatus }).subscribe({
      next: (response) => {
        this.toast.success(
          response.message ||
            (nextStatus ? 'User activated successfully.' : 'User deactivated successfully.'),
        );

        this.updatingUserId.set(null);
        this.loadUsers();
      },
      error: (error) => {
        console.error('Failed to update user status:', error);
        this.toast.error(error.error?.message ?? 'Unable to update user status.');
        this.updatingUserId.set(null);
      },
    });
  }

  confirmDelete(user: AdminUser): void {
    if (this.isCurrentUser(user) || this.deletingUserId()) {
      return;
    }

    this.userToDelete.set(user);
  }

  cancelDelete(): void {
    if (!this.deletingUserId()) {
      this.userToDelete.set(null);
    }
  }

  deleteUser(): void {
    const user = this.userToDelete();

    if (!user || this.isCurrentUser(user) || this.deletingUserId()) {
      return;
    }

    this.deletingUserId.set(user._id);

    this.adminService.deleteUser(user._id).subscribe({
      next: (response) => {
        this.toast.success(response.message || 'User deleted successfully.');
        this.userToDelete.set(null);
        this.deletingUserId.set(null);

        // Return to the previous page if its last user was deleted.
        if (this.users().length === 1 && this.currentPage() > 1) {
          this.currentPage.update((page) => page - 1);
        }

        this.loadUsers();
      },
      error: (error) => {
        console.error('Failed to delete user:', error);
        this.toast.error(error.error?.message ?? 'Unable to delete this user.');
        this.deletingUserId.set(null);
      },
    });
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }

  getInitials(username: string): string {
    return username
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  trackByUserId(_index: number, user: AdminUser): string {
    return user._id;
  }
}
