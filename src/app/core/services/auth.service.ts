import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  RegisterPayload,
  AuthResponse,
  LoginPayload,
  ResetPasswordPayload,
  ProfileResponse,
} from '../models/auth.model';
import { StorageService } from './storage.service';

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

  currentUser = signal<User | null>(this.getUserFromStorage());
  private _token = signal<string | null>(localStorage.getItem('access_token'));

  isLoggedIn = computed(() => !!this._token());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isSeller = computed(() => this.currentUser()?.role === 'seller');

  private getUserFromStorage(): User | null {
    const stored = this.storage.getItem<User | ProfileResponse>('user');
    const user = stored && 'data' in stored ? stored.data : (stored as User);
    return user ?? null;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const payload: LoginPayload = { email, password };
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload)
    );

    if (response?.access_token) {
      localStorage.setItem('access_token', response.access_token);
      this._token.set(response.access_token);
      try {
        const user = await this.getProfile();
        if (user) {
          this.storage.setItem('user', user);
          this.currentUser.set(user);
        }
      } catch (error) {
        console.error('[AuthService] Failed to fetch user profile after login', error);
      }
    }

    if (response?.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  }

  async getProfile(): Promise<User> {
    const response = await firstValueFrom(
      this.http.get<ProfileResponse | User>(`${this.baseUrl}/user/profile`)
    );
    const user = 'data' in response ? response.data : response;
    return user;
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload));
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${this.baseUrl}/auth/forgetPass`, { email })
    );
  }

  async resetPassword(
    email: string,
    payload: Omit<ResetPasswordPayload, 'email'>
  ): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${this.baseUrl}/auth/resetPass?email=${email}`, payload)
    );
  }

  async updateProfile(payload: Record<string, unknown>): Promise<void> {
    const response = await firstValueFrom(
      this.http.patch<{ success: boolean; message: string }>(
        `${this.baseUrl}/user/profile/update`,
        payload
      )
    );

    if (response?.success) {
      const updatedUser = await this.getProfile();
      this.storage.setItem('user', updatedUser);
      this.currentUser.set(updatedUser);
    }
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
