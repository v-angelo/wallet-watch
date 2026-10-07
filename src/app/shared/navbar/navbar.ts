import { Component, inject, signal } from '@angular/core';
import { LucideMenu, LucideMoon, LucideSun, LucideX } from '@lucide/angular';
import { ThemeService } from '../../core/services/theme';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [LucideMenu, LucideMoon, LucideSun, LucideX, RouterLink],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  readonly themeService = inject(ThemeService);

  readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  readonly mobileMenuOpen = signal(false);

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
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
