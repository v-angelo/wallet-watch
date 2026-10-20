import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideUserRound,
  LucideCamera,
  LucideSave,
  LucidePalette,
  LucideSun,
  LucideMoon,
  LucideGlobe,
  LucideShieldCheck,
  LucideLockKeyhole,
  LucideEye,
  LucideEyeOff,
  LucideAlertTriangle,
  LucideChevronDown,
  LucideCheck,
} from '@lucide/angular';

import { ThemeService } from '../../../core/services/theme.service';
import { UserAvatar } from '../../../layouts/user-avatar/user-avatar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    UserAvatar,
    LucideUserRound,
    LucideCamera,
    LucideSave,
    LucidePalette,
    LucideSun,
    LucideMoon,
    LucideGlobe,
    LucideShieldCheck,
    LucideLockKeyhole,
    LucideEye,
    LucideEyeOff,
    LucideAlertTriangle,
    LucideChevronDown,
    LucideCheck,
  ],
  templateUrl: './settings.html',
})
export class Settings {
  private readonly fb = inject(FormBuilder);
  private readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);

  // UI state
  readonly activeSection = signal('profile');
  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly isSavingProfile = signal(false);
  readonly isSavingPreferences = signal(false);
  readonly isChangingPassword = signal(false);
  readonly showDeactivateConfirmation = signal(false);

  // replace these defaults with the logged-in user's data later.
  readonly isDarkMode = signal(false);

  // profile form
  readonly profileForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    email: [{ value: '', disabled: true }],
    profilePic: [''],
  });

  // preferences form
  readonly preferencesForm = this.fb.nonNullable.group({
    currency: ['INR', Validators.required],
    dateFormat: ['DD/MM/YYYY', Validators.required],
  });

  // password form
  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    confirmPassword: ['', Validators.required],
  });

  readonly currencies = [
    { code: 'INR', label: 'Indian Rupee (₹)' },
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'CAD', label: 'Canadian Dollar (C$)' },
    { code: 'AUD', label: 'Australian Dollar (A$)' },
  ];

  readonly dateFormats = [
    { value: 'DD/MM/YYYY', example: '20/10/2026' },
    { value: 'MM/DD/YYYY', example: '10/20/2026' },
    { value: 'YYYY-MM-DD', example: '2026-10-20' },
  ];

  constructor() {
    this.isDarkMode.set(this.themeService.theme() === 'dark');

    const user = this.authService.user();

    if (user) {
      this.profileForm.patchValue({
        username: user.username ?? '',
        email: user.email ?? '',
        profilePic: user.profilePic ?? '',
      });

      this.preferencesForm.patchValue({
        currency: user.currency ?? 'INR',
        dateFormat: user.dateFormat ?? 'DD/MM/YYYY',
      });
    }
  }

  get usernameInitials(): string {
    const username = this.profileForm.controls.username.value.trim();

    if (!username) {
      return 'U';
    }

    return username
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  setActiveSection(section: string): void {
    this.activeSection.set(section);
  }

  onProfilePictureChange(): void {
    const url = this.profileForm.controls.profilePic.value.trim();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    // TODO: call UserService.updateProfile() here.
    console.log('Profile form:', this.profileForm.getRawValue());
  }

  savePreferences(): void {
    if (this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }

    // TODO: call UserService.updatePreferences() here.
    console.log('Preferences:', this.preferencesForm.getRawValue());
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode.set(this.themeService.theme() === 'dark');

    // TODO: persist the selected theme through the backend.
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.passwordForm.controls.confirmPassword.setErrors({
        passwordMismatch: true,
      });
      return;
    }

    // TODO: call UserService.changePassword() here.
    console.log('Password form is valid.');

    this.passwordForm.reset();
  }

  confirmDeactivateAccount(): void {
    this.showDeactivateConfirmation.set(true);
  }

  cancelDeactivateAccount(): void {
    this.showDeactivateConfirmation.set(false);
  }

  deactivateAccount(): void {
    // TODO: call the backend deactivation endpoint.
    // only log the user out after the server confirms success.
    console.log('Account deactivation requested.');
    this.showDeactivateConfirmation.set(false);
  }
}
