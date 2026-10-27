import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.initializeAuth();

  const user = authService.getUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  if (user.role !== 'admin') {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
