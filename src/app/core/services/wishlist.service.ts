import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  // Minimal implementation for MainLayout badge (TASK-K02 requirement)
  // Full implementation will be in TASK-K03
  private _items = signal<unknown[]>([]);
  itemCount = computed(() => this._items().length);

  isInWishlist(): boolean {
    return false;
  }
}
