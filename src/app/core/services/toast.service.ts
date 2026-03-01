import { Injectable } from '@angular/core';
import { ToastFacade } from '../tokens/app.tokens';

@Injectable({
  providedIn: 'root',
})
export class ToastService implements ToastFacade {
  // Simple implementation to satisfy the facade
  show(message: string): void {
    console.log('[Toast]:', message);
    // Real implementation with PrimeNG or other UI will follow later in Phase 0
  }
}
