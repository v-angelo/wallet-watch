import { Component, inject, Input, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [],
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.css',
})
export class UserAvatar {
  private readonly authService = inject(AuthService);

  @Input() size = 36;

  readonly currentUser = this.authService.user;
  readonly imageError = signal(false);

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

  get profilePic(): string {
    return this.currentUser()?.profilePic?.trim() ?? '';
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  onImageLoad(): void {
    this.imageError.set(false);
  }
}
