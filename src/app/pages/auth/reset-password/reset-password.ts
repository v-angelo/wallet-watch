import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { finalize } from 'rxjs';

import { Navbar } from '../../../shared/navbar/navbar';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

import { noWhitespaceValidator } from '../../../core/validators/auth.validators';
import {
  LucideCircleCheck,
  LucideCircleX,
  LucideEye,
  LucideEyeOff,
  LucideLockKeyhole,
} from '@lucide/angular';

// check whether both passwords match
const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password',
  imports: [
    Navbar,
    RouterLink,
    ReactiveFormsModule,
    LucideCircleX,
    LucideCircleCheck,
    LucideLockKeyhole,
    LucideEye,
    LucideEyeOff,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private fb = inject(FormBuilder);

  private authService = inject(AuthService);

  private toast = inject(ToastService);

  private route = inject(ActivatedRoute);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // retrieve token from the URL
  private resetToken = this.route.snapshot.queryParamMap.get('token');

  isLoading = signal(false);

  isSuccess = signal(false);

  isInvalidToken = signal(!this.resetToken || !/^[a-f0-9]{64}$/i.test(this.resetToken));

  resetPasswordForm = this.fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          noWhitespaceValidator,
          Validators.minLength(8),
          Validators.maxLength(72),
        ],
      ],

      confirmPassword: ['', [Validators.required, noWhitespaceValidator]],
    },
    {
      validators: passwordMatchValidator,
    },
  );

  get f() {
    return this.resetPasswordForm.controls;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (this.isLoading() || !this.resetToken) return;

    const password = this.f.password.value!;

    this.isLoading.set(true);

    this.authService
      .resetPasswordAPI(this.resetToken, { password })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.isSuccess.set(true);

          this.toast.success(response.message);
        },

        error: (error) => {
          console.error('Reset password error:', error);

          const message = error.error?.message;

          if (
            error.status === 400 &&
            typeof message === 'string' &&
            message.toLowerCase().includes('invalid or expired')
          ) {
            this.isInvalidToken.set(true);
            return;
          }

          this.toast.error(message ?? 'Unable to reset your password. Please try again.');
        },
      });
  }
}
