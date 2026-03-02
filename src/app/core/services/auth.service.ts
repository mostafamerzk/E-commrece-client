import { Injectable, signal, inject, computed } from '@angular/core';
import { AuthFacade } from '../tokens/app.tokens';
import { StorageService } from './storage.service';
import { User, LoginPayload, AuthResponse } from '../models/auth.model';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthFacade {
  private storage = inject(StorageService);
  private api = inject(ApiService);

  // Core signals
  currentUser = signal<User | null>(this.storage.getItem('user'));
  private _token = signal<string | null>(this.storage.getItem('access_token'));

  // Computed signals for derived state
  isLoggedIn = computed(() => !!this._token());
  role = computed(() => this.currentUser()?.role || null);
  isAdmin = computed(() => this.role() === 'admin');
  isSeller = computed(() => this.role() === 'seller');

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.api.post<AuthResponse, LoginPayload>('/auth/login', payload).pipe(
      tap((res) => {
        this.storage.setItem('access_token', res.token);
        this.storage.setItem('user', res.user);
        this.storage.setItem('role', res.user.role);

        this._token.set(res.token);
        this.currentUser.set(res.user);
      })
    );
  }

  logout(): void {
    this.storage.removeItem('access_token');
    this.storage.removeItem('user');
    this.storage.removeItem('role');

    this._token.set(null);
    this.currentUser.set(null);
  }
}
