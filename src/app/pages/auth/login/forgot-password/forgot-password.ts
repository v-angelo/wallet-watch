import { Component, EventEmitter, inject, Output, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

import { noWhitespaceValidator } from '../../../../core/validators/auth.validators';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  isLoading = signal(false);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, noWhitespaceValidator, Validators.email]],
  });

  get f() {
    return this.forgotPasswordForm.controls;
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    if (this.isLoading()) return;

    const email = this.f.email.value!.trim().toLowerCase();

    this.isLoading.set(true);

    this.authService
      .forgotPasswordAPI({ email })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.submitted.emit();
        },
        error: (error) => {
          console.error('Forgot password error:', error);

          this.toast.error(
            error.error?.message ?? 'Unable to process your request. Please try again.',
          );
        },
      });
  }

  closeModal(): void {
    if (this.isLoading()) return;

    this.closed.emit();
  }
}
