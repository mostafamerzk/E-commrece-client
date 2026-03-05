import { InjectionToken, Signal } from '@angular/core';
import { LoginResponse } from '../services/auth.service';
import { User, ResetPasswordPayload } from '../models/auth.model';

export interface AuthFacade {
  login(email: string, password: string): Promise<LoginResponse>;
  logout(): void;
  isLoggedIn: Signal<boolean>;
  currentUser: Signal<User | null>;
  getAccessToken(): string | null;
  isAdmin: Signal<boolean>;
  isSeller: Signal<boolean>;
  forgetPassword(email: string): Promise<{ message: string }>;
  resetPassword(
    email: string,
    payload: Omit<ResetPasswordPayload, 'email'>
  ): Promise<{ message: string }>;
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
