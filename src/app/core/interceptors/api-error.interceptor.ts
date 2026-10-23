import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // auth components already handle their own errors.
        const isAuthRequest = /\/(login|register|logout)(\/|\?|$)/i.test(req.url);

        // ignore expected authentication/session failures.
        if (!isAuthRequest && error.status !== 401) {
          let message: string;

          if (error.status === 0) {
            message = 'Unable to connect to the server. Check your connection and try again.';
          } else if (error.status >= 500) {
            message = error.error?.message || 'A server error occurred. Please try again later.';
          } else {
            message = error.error?.message || 'The request failed. Please try again.';
          }

          toastService.error(message, 4000);
        }
      }

      // preserve the error so existing error handling still works.
      return throwError(() => error);
    }),
  );
};
