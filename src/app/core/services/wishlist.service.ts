import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Product } from '../models/product.model';

// ── Response shapes ──────────────────────────────────────
interface WishlistResponse {
  message: string;
  wishlist: {
    userId: string;
    products: Product[];
  };
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private api = inject(ApiService);
  private readonly endpoint = API_ENDPOINTS.WISHLIST;

  // ── State ────────────────────────────────────────────────
  private _items = signal<Product[]>([]);

  readonly items = this._items.asReadonly();

  // عدد الـ items — للـ header badge
  readonly itemCount = computed(() => this._items().length);

  // ── API Calls ────────────────────────────────────────────

  // جيب الـ wishlist من السيرفر
  getWishlist(): Observable<WishlistResponse> {
    return this.api
      .get<WishlistResponse>(this.endpoint)
      .pipe(tap((res) => this._items.set(res.wishlist.products)));
  }

  // ضيف أو شيل منتج (toggle)
  toggleWishlist(productId: string): Observable<WishlistResponse> {
    return this.api
      .post<WishlistResponse, { productId: string }>(this.endpoint, { productId })
      .pipe(tap((res) => this._items.set(res.wishlist.products)));
  }

  // هل المنتج ده موجود في الـ wishlist؟
  isInWishlist(productId: string): boolean {
    return this._items().some((p) => p._id === productId);
  }

  // امسح الـ state بس (بعد logout)
  clearWishlist(): void {
    this._items.set([]);
  }
}
