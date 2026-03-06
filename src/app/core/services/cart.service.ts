import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Observable, tap, of, forkJoin, map, switchMap, catchError } from 'rxjs';
import {
  Cart,
  CartResponse,
  AddToCartPayload,
  UpdateCartPayload,
  CartItem,
} from '../models/cart.model';
import { MessageResponse } from '../models/shared.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = inject(ApiService);
  private storage = inject(StorageService);
  private authService = inject(AuthService);
  private readonly endpoint = API_ENDPOINTS.CART;
  private readonly GUEST_CART_KEY = 'guest_cart';

  // ── State ────────────────────────────────────────────────
  private _cart = signal<Cart | null>(null);
  readonly cart = this._cart.asReadonly();

  readonly items = computed(() => this._cart()?.products ?? []);

  readonly itemCount = computed(() =>
    this.items().reduce((count, item) => count + item.quantity, 0)
  );
  readonly totalPrice = computed(() => {
    const cart = this._cart();
    if (!cart) return 0;
    // If backend provided totalPrice, use it, otherwise calculate (for guest cart)
    return (
      cart.totalPrice || this.items().reduce((total, item) => total + item.price * item.quantity, 0)
    );
  });

  constructor() {
    // Initial load
    this.loadCart();

    // Effect to sync cart when user logs in or reset on logout
    effect(
      () => {
        if (this.authService.isLoggedIn()) {
          this.syncCartWithBackend().subscribe();
        } else {
          // On logout, reload the cart (which will try to load guest cart)
          this.loadCart();
        }
      },
      { allowSignalWrites: true }
    );
  }

  private loadCart() {
    if (this.authService.isLoggedIn()) {
      this.getCart().subscribe();
    } else {
      const guestCart = this.storage.getItem<CartItem[]>(this.GUEST_CART_KEY);
      if (guestCart) {
        this._cart.set({
          userId: 'guest',
          products: guestCart,
          totalPrice: guestCart.reduce((total, item) => total + item.price * item.quantity, 0),
        });
      }
    }
  }

  // ── API Calls ────────────────────────────────────────────

  // Get cart
  getCart(): Observable<CartResponse> {
    if (!this.authService.isLoggedIn()) {
      return of({
        message: 'Guest cart loaded',
        cart: this._cart() || { userId: 'guest', products: [], totalPrice: 0 },
      } as CartResponse);
    }
    return this.api.get<CartResponse>(this.endpoint).pipe(tap((res) => this._cart.set(res.cart)));
  }

  addItem(payload: AddToCartPayload, product?: Product): Observable<CartResponse> {
    if (!this.authService.isLoggedIn()) {
      return this.addGuestItem(payload, product);
    }
    return this.api
      .post<CartResponse, AddToCartPayload>(this.endpoint, payload)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  private addGuestItem(payload: AddToCartPayload, product?: Product): Observable<CartResponse> {
    const currentItems = [...this.items()];
    const existingItemIndex = currentItems.findIndex((i) => i.product._id === payload.productId);
    const quantity = payload.quantity || 1;

    if (existingItemIndex > -1) {
      currentItems[existingItemIndex].quantity += quantity;
    } else if (product) {
      currentItems.push({
        product: product,
        quantity: quantity,
        price: product.finalPrice || product.price,
      });
    }

    this.saveGuestCart(currentItems);
    return of(this.getGuestCartResponse(currentItems));
  }

  updateQuantity(productId: string, payload: UpdateCartPayload): Observable<CartResponse> {
    if (!this.authService.isLoggedIn()) {
      const currentItems = [...this.items()];
      const itemIndex = currentItems.findIndex((i) => i.product._id === productId);

      if (itemIndex > -1) {
        if (payload.quantity !== undefined) {
          currentItems[itemIndex].quantity = payload.quantity;
        } else if (payload.operator === '+') {
          currentItems[itemIndex].quantity += 1;
        } else if (payload.operator === '-') {
          currentItems[itemIndex].quantity -= 1;
        }

        if (currentItems[itemIndex].quantity <= 0) {
          currentItems.splice(itemIndex, 1);
        }
      }

      this.saveGuestCart(currentItems);
      return of(this.getGuestCartResponse(currentItems));
    }

    return this.api
      .patch<CartResponse, UpdateCartPayload>(`${this.endpoint}/${productId}`, payload)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  removeItem(productId: string): Observable<CartResponse> {
    if (!this.authService.isLoggedIn()) {
      const currentItems = this.items().filter((i) => i.product._id !== productId);
      this.saveGuestCart(currentItems);
      return of(this.getGuestCartResponse(currentItems));
    }
    return this.api
      .delete<CartResponse>(`${this.endpoint}/${productId}`)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  // Clear cart (server)
  clearCart(): Observable<MessageResponse> {
    if (!this.authService.isLoggedIn()) {
      this.storage.removeItem(this.GUEST_CART_KEY);
      this._cart.set(null);
      return of({ message: 'Guest cart cleared' });
    }
    return this.api.delete<MessageResponse>(this.endpoint).pipe(tap(() => this._cart.set(null)));
  }

  private saveGuestCart(items: CartItem[]) {
    this.storage.setItem(this.GUEST_CART_KEY, items);
    this._cart.set({
      userId: 'guest',
      products: items,
      totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
    });
  }

  private getGuestCartResponse(items: CartItem[]): CartResponse {
    return {
      message: 'Guest cart updated',
      cart: {
        userId: 'guest',
        products: items,
        totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
      },
    };
  }

  syncCartWithBackend(): Observable<CartResponse | null> {
    const guestCart = this.storage.getItem<CartItem[]>(this.GUEST_CART_KEY);
    if (!guestCart || guestCart.length === 0) {
      return this.getCart().pipe(map((res) => res));
    }

    // Sync each item to backend
    // Note: Backend might have an endpoint to sync full cart, but standard is POST /cart for each
    const syncRequests = guestCart.map((item) =>
      this.api.post<CartResponse, AddToCartPayload>(this.endpoint, {
        productId: item.product._id,
        quantity: item.quantity,
      })
    );

    return forkJoin(syncRequests).pipe(
      switchMap(() => {
        this.storage.removeItem(this.GUEST_CART_KEY);
        return this.getCart();
      }),
      catchError((err) => {
        console.error('Error syncing cart:', err);
        return of(null);
      })
    );
  }

  // Backward compatibility aliases
  addToCart(productId: string, quantity = 1): Observable<CartResponse> {
    return this.addItem({ productId, quantity });
  }

  isInCart(productId: string): boolean {
    return this.items().some((item) => item.product._id === productId);
  }
  loadInitialCart() {
    this.loadCart();
  }
}
