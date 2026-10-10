import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Topbar } from './topbar/topbar';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  private readonly router = inject(Router);

  private readonly authService = inject(AuthService);

  logout(): void {
    this.closeMobileMenu();
    this.authService.logoutAPI();
    this.router.navigate(['/']);
  }
}
