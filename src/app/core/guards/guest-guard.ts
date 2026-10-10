import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.initializeAuth();

  if (authService.getUser()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
