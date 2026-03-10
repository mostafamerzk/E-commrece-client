import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, of, throwError, finalize } from 'rxjs';
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
    return this.api.get<GetWishlistResponse>(this.endpoint).pipe(
      tap((res) => {
        if (!Array.isArray(res.wishlist)) return;

        const first = res.wishlist[0];
        if (first && typeof first === 'object') {
          this._items.set(res.wishlist as Product[]);
        }
      })
    );
  }

  private addToWishlist(productId: string, product?: Product): Observable<WishlistResponse> {
    this._items.update((items) => {
      if (items.some((p) => p._id === productId)) return items;
      return [...items, product ?? ({ _id: productId } as Product)];
    });

    return this.api.post<WishlistResponse, object>(`${this.endpoint}/${productId}`, {}).pipe(
      tap((res) => {
        const ids = res.wishlist as string[];
        this._items.update((items) => {
          const existingIds = new Set(items.map((p) => p._id));
          const missingIds = ids.filter((id) => !existingIds.has(id));
          return [
            ...items.filter((p) => ids.includes(p._id)),
            ...missingIds.map((id) => ({ _id: id }) as Product),
          ];
        });
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 409) {
          return of({ message: 'already in wishlist', wishlist: [] as Product[] });
        }
        this._items.update((items) => items.filter((p) => p._id !== productId));
        return throwError(() => err);
      })
    );
  }

  // ── DELETE /wish/user/wishlist/:id ────────────────────────
  private removeFromWishlist(productId: string): Observable<WishlistResponse> {
    this._items.update((items) => items.filter((p) => p._id !== productId));

    return this.api.delete<WishlistResponse>(`${this.endpoint}/${productId}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this.getWishlist().subscribe();
        throw err;
      })
    );
  }
  isInWishlist(productId: string): boolean {
    return this._items().some((p) => p._id === productId);
  }
  // ── TOGGLE ────────────────────────────────────────────────
  private isToggling = signal<Set<string>>(new Set());

  isTogglingWishlist(productId: string): boolean {
    return this.isToggling().has(productId);
  }

  toggleWishlist(
    productId: string,
    product?: Product
  ): Observable<WishlistResponse | GetWishlistResponse> {
    if (this.isToggling().has(productId)) return of({ message: 'pending', wishlist: [] });

    this.isToggling.update((set) => new Set(set).add(productId));

    const action$ = this.isInWishlist(productId)
      ? this.removeFromWishlist(productId)
      : this.addToWishlist(productId, product);

    return action$.pipe(
      finalize(() => {
        this.isToggling.update((set) => {
          const next = new Set(set);
          next.delete(productId);
          return next;
        });
      })
    );
  }

  clearWishlist(): void {
    this._items.set([]);
  }
}
