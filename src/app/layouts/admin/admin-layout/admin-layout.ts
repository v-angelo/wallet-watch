import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import {
  LucideShieldCheck,
  LucideLayoutDashboard,
  LucideUsers,
  LucideMenu,
  LucideX,
  LucideSun,
  LucideMoon,
  LucideWallet,
  LucideChartNoAxesCombined,
  LucideLogOut,
} from '@lucide/angular';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ProfileMenu } from '../../../shared/profile-menu/profile-menu';
import { UserAvatar } from '../../../shared/user-avatar/user-avatar';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ProfileMenu,
    LucideWallet,
    LucideShieldCheck,
    LucideLayoutDashboard,
    LucideChartNoAxesCombined,
    LucideUsers,
    LucideMenu,
    LucideX,
    LucideSun,
    LucideMoon,
    UserAvatar,
    LucideLogOut,
  ],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.closeMobileMenu();

    this.authService.logoutAPI().subscribe({
      next: (response) => {
        this.authService.setUser(null);

        this.toast.success(response.message || 'Logged out successfully!');

        this.router.navigate(['/']);
      },

      error: (error) => {
        console.error('Logout error:', error);

        this.authService.setUser(null);

        this.toast.error(error.error?.message ?? 'Something went wrong while logging out.');

        this.router.navigate(['/']);
      },
    });
  }
}
