import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { AUTH_FACADE, TOAST_FACADE } from '../tokens/app.tokens';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AUTH_FACADE, { optional: true });
  const toastService = inject(TOAST_FACADE, { optional: true });
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // ✅ 409 — re-throw silently so the calling service/component can handle it
      // No toast shown — the component displays its own error message
      if (error.status === 409) {
        return throwError(() => error);
      }

      const serverMessage: string = error.error?.message ?? '';

      // ── Detect expired / invalid JWT regardless of status code ──────────
      // Some backends return 500 instead of 401 for jwt errors
      const isJwtError =
        error.status === 401 ||
        (error.status === 500 && /jwt (expired|invalid|malformed)/i.test(serverMessage));

      if (isJwtError) {
        authService?.logout();
        router.navigate(['/auth/login']);
        toastService?.show('Session expired — please login again');
        return EMPTY; // stop propagation, no need to re-throw
      }

      // ── Build user-facing message ────────────────────────────────────────
      let message = serverMessage || 'Something went wrong';

      if (error.status === 0) {
        message = 'Cannot reach server — check your connection';
      } else if (error.status === 400) {
        message = serverMessage || 'Invalid request — please check your data';
      } else if (error.status === 403) {
        message = 'Forbidden — you do not have permission for this action';
      } else if (error.status === 404) {
        message = serverMessage || 'Resource not found';
      } else if (error.status === 422) {
        message = 'Validation error — please check the input fields';
      } else if (error.status === 429) {
        message = 'Too many requests — please try again later';
      } else if (error.status >= 500) {
        message = 'Server error — our team is looking into it';
      }

      console.error('[API ERROR]:', message);

      // Skip toast for expected scenarios
      const silentMessages = ['Cart Not Found'];
      if (!silentMessages.includes(serverMessage)) {
        toastService?.show(message);
      }

      return throwError(() => error);
    })
  );
};
