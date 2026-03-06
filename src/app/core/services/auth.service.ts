import { Injectable, inject, signal, computed } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, RegisterPayload, AuthResponse, ResetPasswordPayload } from '../models/auth.model';
import { StorageService } from './storage.service';

// AuthFacade is defined in app.tokens.ts

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: string;
  message: string;
  access_token: string;
  refresh_token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private baseUrl = environment.apiUrl;

  // Core signals for UI reactivity
  currentUser = signal<User | null>(this.storage.getItem<User>('user'));
  private _token = signal<string | null>(localStorage.getItem('access_token'));

  // Computed signals
  isLoggedIn = computed(() => !!this._token());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isSeller = computed(() => this.currentUser()?.role === 'seller');

  async login(email: string, password: string): Promise<LoginResponse> {
    const payload = { email, password };
    const response = await firstValueFrom(
      this.http.post<LoginResponse & { user?: User }>(`${this.baseUrl}/auth/login`, payload)
    );

    if (response?.access_token) {
      localStorage.setItem('access_token', response.access_token);
      this._token.set(response.access_token);
    }

    if (response?.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    // If API returns user object, store it for UI reactivity
    if (response?.user) {
      this.storage.setItem('user', response.user);
      this.currentUser.set(response.user);
    }

    return response as LoginResponse;
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload)
    );
    return response;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await firstValueFrom(
      this.http.post<{ message: string }>(`${this.baseUrl}/auth/forgetPass`, { email })
    );
    console.log(response);
    return response;
  }

  async resetPassword(
    email: string,
    payload: Omit<ResetPasswordPayload, 'email'>
  ): Promise<{ message: string }> {
    const response = await firstValueFrom(
      this.http.post<{ message: string }>(`${this.baseUrl}/auth/resetPass?email=${email}`, payload)
    );
    return response;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.storage.removeItem('user');
    this._token.set(null);
    this.currentUser.set(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
