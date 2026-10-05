import { Component, inject, signal } from '@angular/core';
import { Navbar } from '../../../shared/navbar/navbar';
import { Router, RouterLink } from '@angular/router';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';

const noWhitespaceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (typeof value !== 'string') {
    return null;
  }

  return value.trim().length === 0 ? { whitespace: true } : null;
};

const nameValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (value !== trimmedValue) {
    return { whitespace: true };
  }

  if (trimmedValue.length < 2) {
    return { minlength: true };
  }

  return null;
};

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  imports: [Navbar, RouterLink, ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);

  private authService = inject(AuthService);

  private readonly router = inject(Router);

  isLoading = signal(false);

  private toast = inject(ToastService);

  registerForm = this.fb.group(
    {
      username: ['', [Validators.required, nameValidator]],
      email: ['', [Validators.required, noWhitespaceValidator, Validators.email]],
      password: ['', [Validators.required, noWhitespaceValidator, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, noWhitespaceValidator]],
    },
    {
      validators: passwordMatchValidator,
    },
  );

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.isLoading()) return;

    const { username, email, password } = this.registerForm.getRawValue();

    this.isLoading.set(true);

    this.authService
      .registerAPI({
        username: username!,
        email: email!,
        password: password!,
      })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.toast.success(response.message);

          console.log(response);

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },

        error: (error) => {
          console.error('Registration error:', error);

          this.toast.error(error.error?.message ?? 'Registration failed. Please try again.');
        },
      });
  }
}
