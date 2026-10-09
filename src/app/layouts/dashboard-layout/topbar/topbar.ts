import { Component, EventEmitter, Output } from '@angular/core';
import {
  LucideMenu,
  LucideSearch,
  LucideBell,
  LucideChevronDown,
  LucideUserRound,
  LucideSettings,
  LucideLogOut,
} from '@lucide/angular';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    LucideMenu,
    LucideSearch,
    LucideBell,
    LucideChevronDown,
    LucideUserRound,
    LucideSettings,
    LucideLogOut,
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
}
