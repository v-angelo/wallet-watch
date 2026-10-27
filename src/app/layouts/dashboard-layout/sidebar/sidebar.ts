import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideWallet,
  LucideLayoutDashboard,
  LucideArrowLeftRight,
  LucideChartNoAxesColumn,
  LucideTarget,
  LucideSettings,
  LucideLogOut,
  LucideX,
  LucideShieldCheck,
} from '@lucide/angular';
import { UserAvatar } from '../../../shared/user-avatar/user-avatar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideWallet,
    LucideLayoutDashboard,
    LucideArrowLeftRight,
    LucideChartNoAxesColumn,
    LucideTarget,
    LucideSettings,
    LucideLogOut,
    LucideX,
    LucideShieldCheck,
    UserAvatar,
  ],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  @Output() closeMenu = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Input() mobileOpen = false;

  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.user;
}
