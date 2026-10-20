import { Component, ElementRef, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LucideChevronDown, LucideLogOut, LucideSettings } from '@lucide/angular';

import { AuthService } from '../../core/services/auth.service';
import { UserAvatar } from '../user-avatar/user-avatar';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [RouterLink, UserAvatar, LucideChevronDown, LucideSettings, LucideLogOut],
  templateUrl: './profile-menu.html',
})
export class ProfileMenu {
  readonly authService = inject(AuthService);

  private readonly elementRef = inject(ElementRef);

  @Output() logoutRequested = new EventEmitter<void>();

  profileMenuOpen = false;

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  onLogout(): void {
    this.closeProfileMenu();
    this.logoutRequested.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.profileMenuOpen) return;

    const target = event.target;

    if (target instanceof Node && !this.elementRef.nativeElement.contains(target)) {
      this.closeProfileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeProfileMenu();
  }
}
