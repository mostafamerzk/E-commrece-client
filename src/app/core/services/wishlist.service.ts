import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { Product } from '../models/product.model';
import { API_ENDPOINTS } from '../constants/api-endpoints';

interface WishlistResponse {
  message: string;
  wishlist: Product[] | string[];
}

interface GetWishlistResponse {
  message: string;
  wishlist: Product[];
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private api = inject(ApiService);
  private readonly endpoint = API_ENDPOINTS.WISHLIST; // '/wish/user/wishlist'

  private _items = signal<Product[]>([]);
  readonly items = this._items.asReadonly();
  readonly itemCount = computed(() => this._items().length);

  // ── GET /wish/user/wishlist ───────────────────────────────
  getWishlist(): Observable<GetWishlistResponse> {
    return this.api
      .get<GetWishlistResponse>(this.endpoint)
      .pipe(
        tap((res) =>
          this._items.set(Array.isArray(res.wishlist) ? (res.wishlist as Product[]) : [])
        )
      );
  }

  // ── POST /wish/user/wishlist/:id ──────────────────────────
  private addToWishlist(productId: string, product?: Product): Observable<WishlistResponse> {
    // ✅ Optimistic update أولاً
    this._items.update((items) => {
      if (items.some((p) => p._id === productId)) return items;
      return [...items, product ?? ({ _id: productId } as Product)];
    });

    return this.api.post<WishlistResponse, object>(`${this.endpoint}/${productId}`, {}).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 409) {
          return of({ message: 'already in wishlist', wishlist: [] as Product[] });
        }
        this._items.update((items) => items.filter((p) => p._id !== productId));
        return throwError(() => err); // ✅
      })
    );
  }

  // ── DELETE /wish/user/wishlist/:id ────────────────────────
  private removeFromWishlist(productId: string): Observable<WishlistResponse> {
    // ✅ Optimistic update أولاً
    this._items.update((items) => items.filter((p) => p._id !== productId));

    return this.api.delete<WishlistResponse>(`${this.endpoint}/${productId}`).pipe(
      catchError((err: HttpErrorResponse) => {
        // فشل — نرجع المنتج للـ _items
        this.getWishlist().subscribe();
        throw err;
      })
    );
  }

  // ── TOGGLE ────────────────────────────────────────────────
  toggleWishlist(
    productId: string,
    product?: Product
  ): Observable<WishlistResponse | GetWishlistResponse> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    }
    return this.addToWishlist(productId, product);
  }

  isInWishlist(productId: string): boolean {
    return this._items().some((p) => p._id === productId);
  }

  clearWishlist(): void {
    this._items.set([]);
  }
}
