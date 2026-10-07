import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { finalize } from 'rxjs';

import { Navbar } from '../../../shared/navbar/navbar';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

import { noWhitespaceValidator } from '../../../core/validators/auth.validators';

@Component({
  selector: 'app-login',
  imports: [Navbar, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);

  private authService = inject(AuthService);

  private toast = inject(ToastService);

  private router = inject(Router);

  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, noWhitespaceValidator, Validators.email]],

    password: ['', [Validators.required, noWhitespaceValidator]],
  });

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.isLoading()) return;

    const { email, password } = this.loginForm.getRawValue();

    this.isLoading.set(true);

    this.authService
      .loginAPI({
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
          this.authService.setUser(response.data);

          this.toast.success(response.message);

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },

        error: (error) => {
          console.error('Login error:', error);

          this.toast.error(error.error?.message ?? 'Invalid email or password.');
        },
      });
  }
}
