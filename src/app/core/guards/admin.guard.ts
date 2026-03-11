//eslent
import { inject, WritableSignal } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { User, ProfileResponse } from '../models/auth.model';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const storageService = inject(StorageService);

  const user = authService.currentUser();
  const isAdmin = user?.role === 'admin';

  console.log('[AdminGuard] Checking access...', {
    isLoggedIn: authService.isLoggedIn(),
    isAdmin: isAdmin,
    user: user,
  });

  if (isAdmin) {
    return true;
  }

  // Fallback: check localStorage directly if signal is null (race condition during refresh)
  if (!user) {
    const stored = storageService.getItem<User | ProfileResponse>('user');
    // Extract user from nested data structure if present
    const storedUser = stored && 'data' in stored ? stored.data : stored;

    console.log('[AdminGuard] Signal was null, checked localStorage...', { storedUser });
    if (storedUser?.role === 'admin') {
      return true;
    }

    // If still no user but token exists, try to fetch profile
    if (authService.getAccessToken()) {
      console.log('[AdminGuard] Token exists but user not found, fetching profile...');
      try {
        const profile = await authService.getProfile();
        if (profile?.role === 'admin') {
          // Update both signal and storage
          (authService.currentUser as WritableSignal<User | null>).set(profile);
          storageService.setItem('user', profile);
          return true;
        }
      } catch (error) {
        console.error('[AdminGuard] Failed to fetch profile:', error);
      }
    }
  }

  console.warn('[AdminGuard] Access denied, redirecting to /');
  return router.parseUrl('/');
};
