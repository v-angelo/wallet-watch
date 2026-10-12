import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import {
  LucideSun,
  LucideMoon,
  LucideChevronDown,
  LucideUserRound,
  LucideSettings,
  LucideLogOut,
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { UserAvatar } from '../../user-avatar/user-avatar';
import { ThemeService } from '../../../core/services/theme.service';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, startWith } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    LucideSun,
    LucideMoon,
    LucideChevronDown,
    LucideUserRound,
    LucideSettings,
    LucideLogOut,
    UserAvatar,
  ],
  templateUrl: './topbar.html',
})
export class Topbar {
  @Output() menuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  profileMenuOpen = false;

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  onLogout(): void {
    this.closeProfileMenu();
    this.logout.emit();
  }

  readonly themeService = inject(ThemeService);

  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.user;

  private readonly router = inject(Router);

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
    ),
    { initialValue: null },
  );

  readonly pageTitle = computed(() => {
    this.navigationEnd();

    const url = this.router.url.split(/[?#]/)[0];
    const lastSegment = url.split('/').filter(Boolean).pop() ?? 'dashboard';

    const titles: Record<string, string> = {
      dashboard: 'Overview',
      overview: 'Overview',
      transactions: 'Transactions',
      budgets: 'Budgets',
      savings: 'Savings Goals',
      reports: 'Reports',
      settings: 'Settings',
    };

    return titles[lastSegment] ?? 'Dashboard';
  });
}
