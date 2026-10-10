import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  imports: [],
  selector: 'app-user-avatar',
  styleUrl: './user-avatar.css',
  templateUrl: './user-avatar.html',
})
export class UserAvatar {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.user;

  get userInitials(): string {
    const username = this.currentUser()?.username?.trim();

    if (!username) {
      return '?';
    }

    return username
      .split(/\s+/)
      .slice(0, 2)
      .map((part: string) => part.charAt(0).toUpperCase())
      .join('');
  }
}
