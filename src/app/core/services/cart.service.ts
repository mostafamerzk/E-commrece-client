import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Minimal implementation for MainLayout badge
  private _items = signal<unknown[]>([]);
  itemCount = computed(() => this._items().length);

  // Future implementation of cart methods (TASK-F07) will go here
}
