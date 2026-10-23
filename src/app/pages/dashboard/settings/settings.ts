import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  LucideSave,
  LucideSun,
  LucideMoon,
  LucideShieldCheck,
  LucideLockKeyhole,
  LucideEye,
  LucideEyeOff,
  LucideTriangleAlert,
} from '@lucide/angular';

import { ThemeService } from '../../../core/services/theme.service';
import { UserAvatar } from '../../../shared/user-avatar/user-avatar';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

import type { Currency, DateFormat, Theme } from '../../../core/models/user.model';
import {
  matchFieldsValidator,
  nameValidator,
  noWhitespaceValidator,
} from '../../../core/validators/auth.validators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    UserAvatar,
    LucideSave,
    LucideSun,
    LucideMoon,
    LucideShieldCheck,
    LucideLockKeyhole,
    LucideEye,
    LucideEyeOff,
    LucideTriangleAlert,
  ],
  templateUrl: './settings.html',
})
export class Settings {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  // UI state
  readonly activeSection = signal('profile');
  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly isSavingProfile = signal(false);
  readonly isSavingPreferences = signal(false);
  readonly isChangingPassword = signal(false);
  readonly isDeactivatingAccount = signal(false);
  readonly showDeactivateConfirmation = signal(false);
  readonly showCurrencyWarning = signal(false);
  readonly pendingCurrency = signal<Currency | null>(null);

  readonly isDarkMode = signal(false);

  // profile form
  readonly profileForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, nameValidator, Validators.maxLength(30)]],
    email: [{ value: '', disabled: true }],
    profilePic: [''],
  });

  // preferences form
  readonly preferencesForm = this.fb.nonNullable.group({
    currency: ['INR', Validators.required],
    dateFormat: ['DD/MM/YYYY', Validators.required],
  });

  // password form
  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72),
          noWhitespaceValidator,
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: matchFieldsValidator('newPassword', 'confirmPassword'),
    },
  );

  // deactivation form
  readonly deactivationForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
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
    this.syncFormsWithUser();
    this.isDarkMode.set(this.themeService.theme() === 'dark');
  }

  private syncFormsWithUser(): void {
    const user = this.authService.user();

    if (!user) return;

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

  setActiveSection(section: string): void {
    this.activeSection.set(section);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;

      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    return fallback;
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.isSavingProfile()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { username, profilePic } = this.profileForm.getRawValue();

    this.isSavingProfile.set(true);

    this.userService
      .updateProfile({
        username: username.trim(),
        profilePic: profilePic.trim(),
      })
      .pipe(finalize(() => this.isSavingProfile.set(false)))
      .subscribe({
        next: (response) => {
          // userService should update AuthService.user after a successful response.
          this.profileForm.patchValue({
            username: response.data.username,
            email: response.data.email,
            profilePic: response.data.profilePic ?? '',
          });

          this.toastService.show(response.message || 'Profile updated successfully!', 'success');
        },
        error: (error: unknown) => {
          console.error('Failed to update your profile!', error);
        },
      });
  }

  onCurrencySelectionChange(event: Event): void {
    const selectedCurrency = (event.target as HTMLSelectElement).value as Currency;
    const currentCurrency = this.authService.user()?.currency ?? 'INR';

    // no warning is needed when selecting the saved currency.
    if (selectedCurrency === currentCurrency) {
      return;
    }

    // temporarily restore the saved value while asking for confirmation.
    this.pendingCurrency.set(selectedCurrency);
    this.preferencesForm.controls.currency.setValue(currentCurrency);
    this.showCurrencyWarning.set(true);
  }

  confirmCurrencyChange(): void {
    const currency = this.pendingCurrency();

    if (!currency) {
      this.cancelCurrencyChange();
      return;
    }

    // confirming changes the form selection, but doesn't save it to the server.
    // user still needs to click "Save preferences".
    this.preferencesForm.controls.currency.setValue(currency);
    this.showCurrencyWarning.set(false);
    this.pendingCurrency.set(null);
  }

  cancelCurrencyChange(): void {
    const savedCurrency = this.authService.user()?.currency ?? 'INR';

    this.preferencesForm.controls.currency.setValue(savedCurrency);
    this.showCurrencyWarning.set(false);
    this.pendingCurrency.set(null);
  }

  currencyLabel(code: Currency | null): string {
    return this.currencies.find((currency) => currency.code === code)?.label ?? code ?? '';
  }

  savePreferences(): void {
    if (this.preferencesForm.invalid || this.isSavingPreferences()) {
      this.preferencesForm.markAllAsTouched();
      return;
    }

    const { currency, dateFormat } = this.preferencesForm.getRawValue();
    const preferredTheme: Theme = this.isDarkMode() ? 'dark' : 'light';

    this.isSavingPreferences.set(true);

    this.userService
      .updatePreferences({
        currency: currency as Currency,
        dateFormat: dateFormat as DateFormat,
        preferredTheme,
      })
      .pipe(finalize(() => this.isSavingPreferences.set(false)))
      .subscribe({
        next: (response) => {
          this.toastService.show(response.message || 'Preferences saved successfully!', 'success');
        },
        error: (error: unknown) => {
          console.error('Failed to save your preferences!', error);
        },
      });
  }

  toggleTheme(): void {
    const previousTheme: Theme = this.isDarkMode() ? 'dark' : 'light';
    const nextTheme: Theme = previousTheme === 'dark' ? 'light' : 'dark';

    // apply the theme immediately for a responsive UI.
    this.themeService.toggleTheme();
    this.isDarkMode.set(nextTheme === 'dark');

    // persist the preference in the database.
    this.userService.updatePreferences({ preferredTheme: nextTheme }).subscribe({
      next: () => {
        // the theme is already applied locally.
      },
      error: (error: unknown) => {
        // revert the local theme if the server could not save it.
        this.themeService.toggleTheme();
        this.isDarkMode.set(previousTheme === 'dark');

        console.error(
          'Could not save your theme preference. Your previous theme has been restored!',
          error,
        );
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.isChangingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.passwordForm.controls.confirmPassword.setErrors({
        passwordMismatch: true,
      });
      return;
    }

    if (currentPassword === newPassword) {
      this.passwordForm.controls.newPassword.setErrors({
        sameAsCurrent: true,
      });
      return;
    }

    this.isChangingPassword.set(true);

    this.userService
      .changePassword({ currentPassword, newPassword })
      .pipe(finalize(() => this.isChangingPassword.set(false)))
      .subscribe({
        next: (response) => {
          this.passwordForm.reset();

          this.toastService.show(response.message || 'Password changed successfully!', 'success');
        },
        error: (error: unknown) => {
          console.error('Failed to change your password:', error);
        },
      });
  }

  confirmDeactivateAccount(): void {
    this.deactivationForm.reset();
    this.showDeactivateConfirmation.set(true);
  }

  cancelDeactivateAccount(): void {
    if (this.isDeactivatingAccount()) return;

    this.showDeactivateConfirmation.set(false);
    this.deactivationForm.reset();
  }

  deactivateAccount(): void {
    if (this.deactivationForm.invalid || this.isDeactivatingAccount()) {
      this.deactivationForm.markAllAsTouched();
      return;
    }

    const { currentPassword } = this.deactivationForm.getRawValue();

    this.isDeactivatingAccount.set(true);

    this.userService
      .deactivateAccount({ currentPassword })
      .pipe(finalize(() => this.isDeactivatingAccount.set(false)))
      .subscribe({
        next: (response) => {
          this.showDeactivateConfirmation.set(false);
          this.deactivationForm.reset();

          // clear frontend auth state only after the server confirms deactivation.
          this.authService.setUser(null);
          this.authService.authInitialized.set(true);

          this.toastService.show(
            response.message || 'Your account has been deactivated.',
            'success',
          );

          void this.router.navigateByUrl('/');
        },
        error: (error: unknown) => {
          console.error('Failed to deactivate your account!', error);
        },
      });
  }
}
