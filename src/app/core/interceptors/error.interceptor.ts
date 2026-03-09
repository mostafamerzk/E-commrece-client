import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AUTH_FACADE, TOAST_FACADE } from '../tokens/app.tokens';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AUTH_FACADE, { optional: true });
  const toastService = inject(TOAST_FACADE, { optional: true });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Something went wrong';

      if (error.error?.message) {
        message = error.error.message;
      } else if (error.status === 0) {
        message = 'Cannot reach server — check your connection';
      } else if (error.status === 400) {
        message = 'Invalid request — please check your data';
      } else if (error.status === 401) {
        message = 'Unauthorized — please login again';
        localStorage.removeItem('access_token');
        authService?.logout();
      } else if (error.status === 403) {
        message = 'Forbidden — you do not have permission for this action';
      } else if (error.status === 404) {
        message = 'Resource not found';
      } else if (error.status === 409) {
        message = 'Conflict — this resource already exists';
      } else if (error.status === 422) {
        message = 'Validation error — please check the input fields';
      } else if (error.status === 429) {
        message = 'Too many requests — please try again later';
      } else if (error.status >= 500) {
        message = 'Server error — our team is looking into it';
      }

      console.error('[API ERROR]:', message);

      // Skip toast for expected scenarios like "Cart Not Found" for a new user
      if (message !== 'Cart Not Found') {
        toastService?.show(message);
      }

      // Re-throw the original error instead of new Error(message)
      // This allows services to read status codes and specialized messages.
      return throwError(() => error);
    })
  );
};
