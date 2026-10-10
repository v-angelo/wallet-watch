import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Sidebar } from './sidebar/sidebar';
import { Topbar } from './topbar/topbar';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
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
