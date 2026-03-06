import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { MessageResponse } from '../models/shared.model';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Cart, CartResponse, AddToCartPayload, UpdateCartPayload } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = inject(ApiService);
  private readonly endpoint = API_ENDPOINTS.CART;

  // ── State ────────────────────────────────────────────────
  private _cart = signal<Cart | null>(null);
  readonly cart = this._cart.asReadonly();

  readonly items = computed(() => this._cart()?.products ?? []);

  readonly itemCount = computed(() =>
    this.items().reduce((count, item) => count + item.quantity, 0)
  );

  readonly totalPrice = computed(() => this._cart()?.totalPrice ?? 0);

  // ── API Calls ────────────────────────────────────────────

  // Get cart
  getCart(): Observable<CartResponse> {
    return this.api.get<CartResponse>(this.endpoint).pipe(tap((res) => this._cart.set(res.cart)));
  }

  // Add product
  addToCart(productId: string, quantity = 1): Observable<CartResponse> {
    const payload: AddToCartPayload = { productId, quantity };

    return this.api
      .post<CartResponse, AddToCartPayload>(this.endpoint, payload)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  // Update quantity (+ / -)
  updateQuantity(productId: string, operator: '+' | '-'): Observable<CartResponse> {
    const payload: UpdateCartPayload = { operator };

    return this.api
      .patch<CartResponse, UpdateCartPayload>(`${this.endpoint}/${productId}`, payload)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  // Remove product
  removeFromCart(productId: string): Observable<CartResponse> {
    return this.api
      .delete<CartResponse>(`${this.endpoint}/${productId}`)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  // Clear cart (server)
  clearCart(): Observable<MessageResponse> {
    return this.api.delete<MessageResponse>(this.endpoint).pipe(tap(() => this._cart.set(null)));
  }

  // Reset cart locally
  resetCart(): void {
    this._cart.set(null);
  }

  // Check if product exists
  isInCart(productId: string): boolean {
    return this.items().some((item) => item.productId === productId);
  }

  // Load cart on app start
  loadInitialCart() {
    this.getCart().subscribe();
  }
}
