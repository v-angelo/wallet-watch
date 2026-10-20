import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { LucideMenu, LucideMoon, LucideSun, LucideWallet, LucideX } from '@lucide/angular';

import { AuthService } from '../../core/services/auth.service';
import { UserAvatar } from '../user-avatar/user-avatar';
import { ToastService } from '../../core/services/toast.service';
import { ThemeService } from '../../core/services/theme.service';
import { ProfileMenu } from '../profile-menu/profile-menu';

@Component({
  imports: [
    LucideWallet,
    LucideMenu,
    LucideMoon,
    LucideSun,
    LucideX,
    RouterLink,
    UserAvatar,
    ProfileMenu,
  ],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  readonly themeService = inject(ThemeService);

  readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  readonly mobileMenuOpen = signal(false);

  private readonly toast = inject(ToastService);

  isLandingPage(): boolean {
    return this.router.url.split('#')[0] === '/';
  }

  goHome(): void {
    this.closeMobileMenu();

    if (this.isLandingPage()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      this.router.navigate(['/']);
    }
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

        // clear local authentication state even if the request fails.
        this.authService.setUser(null);

        this.toast.error(error.error?.message ?? 'Something went wrong while logging out.');

        this.router.navigate(['/']);
      },
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
