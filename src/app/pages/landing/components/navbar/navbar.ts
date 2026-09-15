import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme';
import { LucideMenu, LucideMoon, LucideSun, LucideX } from '@lucide/angular';

@Component({
  imports: [LucideMenu, LucideMoon, LucideSun, LucideX],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  readonly themeService = inject(ThemeService);

  readonly mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
