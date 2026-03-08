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
  currentUser = signal<User | null>(this.storage.getItem('user'));
  private _token = signal<string | null>(localStorage.getItem('access_token'));

  // Computed signals
  isLoggedIn = computed(() => !!this._token());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isSeller = computed(() => this.currentUser()?.role === 'seller');

  async login(email: string, password: string): Promise<LoginResponse> {
    const payload = { email, password };
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload)
    );

    if (response?.access_token) {
      localStorage.setItem('access_token', response.access_token);
      this._token.set(response.access_token);

      // Fetch profile after successful login
      try {
        const user = await this.getProfile();
        if (user) {
          this.storage.setItem('user', user);
          this.currentUser.set(user);
        }
      } catch (error) {
        console.error('Failed to fetch user profile after login', error);
      }
    }

    if (response?.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  }

  async getProfile(): Promise<User> {
    const response = await firstValueFrom(this.http.get<User>(`${this.baseUrl}/user/profile`));
    //console.log(response.userName);

    return response;
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
