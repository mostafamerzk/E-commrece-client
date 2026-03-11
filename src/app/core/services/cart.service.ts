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
  RawCartItem,
} from '../models/cart.model';
import { MessageResponse } from '../models/shared.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private api = inject(ApiService);
  private storage = inject(StorageService);
  private authService = inject(AuthService);
  private readonly endpoint = API_ENDPOINTS.CART;
  private readonly GUEST_CART_KEY = 'guest_cart';

  private _cart = signal<Cart | null>(null);
  readonly cart = this._cart.asReadonly();

  readonly items = computed(() => (this._cart()?.products ?? []).filter((item) => !!item.product));
  readonly itemCount = computed(() =>
    this.items().reduce((count, item) => count + item.quantity, 0)
  );
  readonly totalPrice = computed(() => {
    const cart = this._cart();
    if (!cart) return 0;
    return this.items().reduce(
      (total, item) => total + (item.price || item.product?.finalPrice || 0) * item.quantity,
      0
    );
  });

  constructor() {
    // Initial load from storage (guest) or fetch from API
    this.initializeCart();

    // Re-sync or re-load whenever logged-in status changes
    effect(() => {
      const loggedIn = this.authService.isLoggedIn();
      // We don't want to run this synchronously in the effect
      // to avoid 'signal writes' warnings and recursive loops.
      // setTimeout or a microtask ensures it runs after current detection cycle.
      Promise.resolve().then(() => {
        if (loggedIn) {
          this.syncCartWithBackend().subscribe();
        } else {
          this.loadGuestCart();
        }
      });
    });
  }

  private initializeCart() {
    if (this.authService.isLoggedIn()) {
      this.getCart().subscribe();
    } else {
      this.loadGuestCart();
    }
  }

  private loadGuestCart() {
    const guestCart = this.storage.getItem<CartItem[]>(this.GUEST_CART_KEY);
    if (guestCart) {
      this._cart.set({
        userId: 'guest',
        products: guestCart,
        totalPrice: guestCart.reduce((total, item) => total + item.price * item.quantity, 0),
      });
    } else {
      this._cart.set(null);
    }
  }

  getCart(): Observable<CartResponse> {
    if (!this.authService.isLoggedIn()) {
      return of({
        message: 'Guest cart loaded',
        cart: this._cart() || { userId: 'guest', products: [], totalPrice: 0 },
      } as CartResponse);
    }
    return this.api.get<CartResponse>(this.endpoint).pipe(
      catchError((err) => {
        // Handle "Cart Not Found" (400) by initializing an empty cart for the user.
        // We check err.status (for raw HTTP errors) and err.message (for errors processed by interceptor).
        const errMsg = err.error?.message || err.message || '';
        if (err.status === 400 || errMsg.includes('Cart Not Found')) {
          const emptyCart: Cart = {
            userId: this.authService.currentUser()?._id || 'unknown',
            products: [],
            totalPrice: 0,
          };
          this._cart.set(emptyCart);
          return of({ message: 'Initialized empty cart', cart: emptyCart } as CartResponse);
        }
        throw err;
      }),
      tap((res) => {
        if (res?.cart) {
          this.mergeServerCart(res.cart);
        }
      })
    );
  }
  addItem(payload: AddToCartPayload, product?: Product): Observable<CartResponse> {
    if (!this.authService.isLoggedIn()) {
      return this.addGuestItem(payload, product);
    }
    return this.api.post<CartResponse, AddToCartPayload>(this.endpoint, payload).pipe(
      tap((res) => {
        console.log('ADD ITEM RESPONSE:', JSON.stringify(res, null, 2));
        if (res?.cart) {
          this.mergeServerCart(res.cart, product);
        }
      })
    );
  }

  private addGuestItem(payload: AddToCartPayload, product?: Product): Observable<CartResponse> {
    const currentItems = this.items().map((i) => ({ ...i }));
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

  updateQuantity(
    productId: string,
    payload: UpdateCartPayload,
    product?: Product
  ): Observable<CartResponse> {
    if (!this.authService.isLoggedIn()) {
      const currentItems = this.items().map((i) => ({ ...i }));
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
      .pipe(
        tap((res) => {
          if (res?.cart) {
            this.mergeServerCart(res.cart, product);
          } else {
            console.warn('Backend returned empty cart in PATCH response');
          }
        })
      );
  }

  /**
   * Updates multiple products in the cart sequentially to avoid race conditions.
   * Returns an observable of the final CartResponse.
   */
  updateItems(updates: { productId: string; quantity: number }[]): Observable<CartResponse | null> {
    if (updates.length === 0) return of(null);
    if (!this.authService.isLoggedIn()) return of(null);

    // We use a recursive approach or a simple chain to ensure sequential updates
    // since each PATCH returns the "new" cart state.
    let chain = this.updateQuantity(updates[0].productId, { quantity: updates[0].quantity });

    for (let i = 1; i < updates.length; i++) {
      const update = updates[i];
      chain = chain.pipe(
        switchMap(() => this.updateQuantity(update.productId, { quantity: update.quantity }))
      );
    }

    return chain;
  }

  /**
   * Merges a server cart response into _cart without losing populated Product objects.
   *
   * The backend's PATCH /cart/:id can return products whose `product` field is
   * either:
   *   (a) a fully-populated Product object  → use it as-is
   *   (b) a bare MongoDB ObjectId string    → re-attach the Product we already
   *                                           have in local state
   *   (c) null / undefined                  → keep the existing local item
   *
   * In all cases, the server's quantities, prices, and totalPrice are adopted so
   * the local state stays in sync with the source of truth.
   */
  private mergeServerCart(serverCart: Cart, newProduct?: Product): void {
    const currentProducts = this._cart()?.products ?? [];

    const mergedProducts = (serverCart.products as RawCartItem[]).map((serverItem) => {
      let productId: string | undefined;

      const productField = serverItem.product;
      const productIdField = serverItem.productId;

      if (typeof productField === 'string') {
        productId = productField;
      } else if (this.isProductObject(productField)) {
        productId = productField._id || productField.id;
      } else if (typeof productIdField === 'string') {
        productId = productIdField;
      } else if (this.isProductObject(productIdField)) {
        productId = productIdField._id || productIdField.id;
      } else if (serverItem._id) {
        productId = serverItem._id;
      }

      if (this.isProductObject(productField)) {
        return { ...serverItem, product: productField };
      }

      const existing = currentProducts.find((p) => p.product?._id === productId);
      if (existing) return { ...serverItem, product: existing.product };

      if (newProduct && newProduct._id === productId) {
        return { ...serverItem, product: newProduct };
      }

      return { ...serverItem, product: { _id: productId } as Product };
    });

    this._cart.set({ ...serverCart, products: [...mergedProducts] as CartItem[] });
  }
  private isProductObject(p: (Product & { id?: string }) | string | undefined): p is Product {
    if (!p || typeof p !== 'object') return false;
    return '_id' in p || 'id' in p;
  }
  removeItem(productId: string): Observable<CartResponse> {
    if (!this.authService.isLoggedIn()) {
      const currentItems = this.items().filter((i) => i.product._id !== productId);
      this.saveGuestCart(currentItems);
      return of(this.getGuestCartResponse(currentItems));
    }
    return this.api.delete<CartResponse>(`${this.endpoint}/${productId}`).pipe(
      tap((res) => {
        if (res?.cart) {
          this.mergeServerCart(res.cart); // ✅ بدل _cart.set
        }
      })
    );
  }

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

  isInCart(productId: string): boolean {
    return this.items().some((item) => item.product._id === productId);
  }

  loadInitialCart() {
    this.initializeCart();
  }

  /** Immediately patches the quantity in the local signal without a network call. */
  optimisticallyUpdateQuantity(productId: string, newQty: number): void {
    this._cart.update((current) => {
      if (!current) return current;
      const updatedProducts = current.products.map((item) => {
        if (!item.product) return item;
        return item.product._id === productId ? { ...item, quantity: newQty } : item;
      });

      return {
        ...current,
        products: [...updatedProducts],
        totalPrice: updatedProducts.reduce((sum, item) => {
          if (!item.product) return sum;
          const qty = item.product._id === productId ? newQty : item.quantity;
          return sum + (item.price ?? item.product.finalPrice ?? 0) * qty;
        }, 0),
      };
    });
  }

  /** Reverts the cart signal to a previous snapshot (used on error). */
  revertCart(snapshot: Cart): void {
    this._cart.set(snapshot);
  }
}
