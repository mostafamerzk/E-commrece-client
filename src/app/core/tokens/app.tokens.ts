import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginPayload, AuthResponse } from '../models/auth.model';

export interface AuthFacade {
  login(payload: LoginPayload): Observable<AuthResponse>;
  logout(): void;
}

export const AUTH_FACADE = new InjectionToken<AuthFacade>('AUTH_FACADE');
export const TOAST_FACADE = new InjectionToken<ToastFacade>('TOAST_FACADE');

export interface ToastFacade {
  show(message: string): void;
  success(message: string, title?: string): void;
  error(message: string, title?: string): void;
  info(message: string, title?: string): void;
  warn(message: string, title?: string): void;
}
