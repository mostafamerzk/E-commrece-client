import { InjectionToken } from '@angular/core';

export interface AuthFacade {
  logout(): void;
}

export interface ToastFacade {
  show(message: string): void;
}

export const AUTH_FACADE = new InjectionToken<AuthFacade>('AUTH_FACADE');
export const TOAST_FACADE = new InjectionToken<ToastFacade>('TOAST_FACADE');
