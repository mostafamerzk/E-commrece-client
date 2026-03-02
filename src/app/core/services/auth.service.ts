import { Injectable, signal, inject } from '@angular/core';
import { AuthFacade } from '../tokens/app.tokens';
import { StorageService } from './storage.service';
import { User } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthFacade {
  private storage = inject(StorageService);

  // Signals for state management as per memory.md
  currentUser = signal<User | null>(this.storage.getItem('user'));
  isLoggedIn = signal<boolean>(!!this.storage.getItem('access_token'));
  role = signal<string | null>(this.storage.getItem('role'));

  logout(): void {
    this.storage.removeItem('access_token');
    this.storage.removeItem('user');
    this.storage.removeItem('role');
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.role.set(null);
  }
}
