import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideWallet,
  LucideLayoutDashboard,
  LucideArrowLeftRight,
  LucideChartNoAxesColumn,
  LucideTarget,
  LucideChartPie,
  LucideSettings,
  LucideLogOut,
  LucideX,
} from '@lucide/angular';

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
    LucideChartPie,
    LucideSettings,
    LucideLogOut,
    LucideX,
  ],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  @Output() closeMenu = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Input() mobileOpen = false;
}
