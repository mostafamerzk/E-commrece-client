import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Cart, CartResponse, AddToCartPayload, UpdateCartPayload } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = inject(ApiService);
  private readonly endpoint = API_ENDPOINTS.CART;

  // ── State ────────────────────────────────────────────────
  private _cart = signal<Cart | null>(null);

  readonly cart = this._cart.asReadonly();

  // عدد الـ items في الـ cart — بيتحسب تلقائي
  readonly itemCount = computed(() => {
    const cart = this._cart();
    if (!cart) return 0;
    return cart.products.reduce((sum, item) => sum + item.quantity, 0);
  });

  readonly totalPrice = computed(() => this._cart()?.totalPrice ?? 0);

  // ── API Calls ────────────────────────────────────────────

  // جيب الـ cart من السيرفر
  getCart(): Observable<CartResponse> {
    return this.api.get<CartResponse>(this.endpoint).pipe(tap((res) => this._cart.set(res.cart)));
  }

  // ضيف منتج للـ cart
  addToCart(productId: string, quantity = 1): Observable<CartResponse> {
    const payload: AddToCartPayload = { productId, quantity };
    return this.api
      .post<CartResponse, AddToCartPayload>(this.endpoint, payload)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  // عدّل الكمية
  updateQuantity(productId: string, operator: '+' | '-'): Observable<CartResponse> {
    const payload: UpdateCartPayload = { operator };
    return this.api
      .patch<CartResponse, UpdateCartPayload>(`${this.endpoint}/${productId}`, payload)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  // شيل منتج من الـ cart
  removeFromCart(productId: string): Observable<CartResponse> {
    return this.api
      .delete<CartResponse>(`${this.endpoint}/${productId}`)
      .pipe(tap((res) => this._cart.set(res.cart)));
  }

  // هل المنتج ده موجود في الـ cart؟
  isInCart(productId: string): boolean {
    return this._cart()?.products.some((i) => i.productId === productId) ?? false;
  }

  // امسح الـ cart من الـ state بس (بعد logout مثلاً)
  clearCart(): void {
    this._cart.set(null);
  }
}
