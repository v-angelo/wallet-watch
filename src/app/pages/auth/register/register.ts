import { Component, inject, signal } from '@angular/core';
import { Navbar } from '../../../shared/navbar/navbar';
import { Router, RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';

import {
  nameValidator,
  noWhitespaceValidator,
  passwordMatchValidator,
} from '../../../core/validators/auth.validators';

import { GoogleSignIn } from '../../../shared/google-sign-in/google-sign-in';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  imports: [Navbar, RouterLink, ReactiveFormsModule, GoogleSignIn, LucideEye, LucideEyeOff],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);

  private authService = inject(AuthService);

  private readonly router = inject(Router);

  private toast = inject(ToastService);

  isLoading = signal(false);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  registerForm = this.fb.group(
    {
      username: ['', [Validators.required, nameValidator]],
      email: ['', [Validators.required, noWhitespaceValidator, Validators.email]],
      password: ['', [Validators.required, noWhitespaceValidator, Validators.minLength(8)]],
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
