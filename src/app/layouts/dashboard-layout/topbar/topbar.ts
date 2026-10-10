import { Component, EventEmitter, inject, Output } from '@angular/core';
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
}
