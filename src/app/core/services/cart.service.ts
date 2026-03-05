import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Observable, tap } from 'rxjs';
import { Cart, CartResponse, AddToCartPayload, UpdateCartPayload } from '../models/cart.model';
import { MessageResponse } from '../models/shared.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = inject(ApiService);
  private readonly endpoint = API_ENDPOINTS.CART;

  // Store the cart state in a signal for reactive updates across the app
  private _cart = signal<Cart | null>(null);
  readonly cart = this._cart.asReadonly();

  // Computed signals for derived state
  readonly items = computed(() => this._cart()?.products ?? []);
  readonly itemCount = computed(() =>
    this.items().reduce((count, item) => count + item.quantity, 0)
  );
  readonly totalPrice = computed(() => this._cart()?.totalPrice ?? 0);

  getCart(): Observable<CartResponse> {
    return this.api.get<CartResponse>(this.endpoint).pipe(tap((res) => this._cart.set(res.cart)));
  }

  /**
   * Add a product to the cart.
   * Supports both raw payload and simple productId/quantity.
   */
  addItem(payload: AddToCartPayload): Observable<CartResponse> {
    return this.api
      .post<CartResponse, AddToCartPayload>(this.endpoint, payload)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  // Convenience alias for addItem
  addToCart(productId: string, quantity = 1): Observable<CartResponse> {
    return this.addItem({ productId, quantity });
  }

  /**
   * Update product quantity in the cart.
   * Supports both raw payload and simple operator (+/-).
   */
  updateQuantity(
    productId: string,
    payload: UpdateCartPayload | '+' | '-'
  ): Observable<CartResponse> {
    const finalPayload = typeof payload === 'string' ? { operator: payload } : payload;
    return this.api
      .patch<CartResponse, UpdateCartPayload>(`${this.endpoint}/${productId}`, finalPayload)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  /**
   * Remove a product from the cart.
   */
  removeItem(productId: string): Observable<CartResponse> {
    return this.api
      .delete<CartResponse>(`${this.endpoint}/${productId}`)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  // Convenience alias for removeItem
  removeFromCart(productId: string): Observable<CartResponse> {
    return this.removeItem(productId);
  }

  clearCart(): Observable<MessageResponse> {
    return this.api.delete<MessageResponse>(this.endpoint).pipe(tap(() => this._cart.set(null)));
  }

  /**
   * Reset the cart state (client-side only).
   */
  resetCart(): void {
    this._cart.set(null);
  }

  isInCart(productId: string): boolean {
    return this.items().some((item) => item.productId === productId);
  }

  // Helper to load cart on app init if needed
  loadInitialCart() {
    this.getCart().subscribe();
  }
}
