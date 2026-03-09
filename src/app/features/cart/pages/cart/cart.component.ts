import { Component, inject, computed, signal, OnDestroy } from '@angular/core';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { finalize, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnDestroy {
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private categoryService = inject(CategoryService);

  constructor() {
    this.categoryService.loadCategories();
  }

  getCategoryName(id: string): string {
    return this.categoryService.getCategoryName(id);
  }

  readonly cart = this.cartService.cart;
  readonly items = this.cartService.items;
  readonly totalPrice = this.cartService.totalPrice;
  readonly itemCount = this.cartService.itemCount;

  readonly shipping = computed(() => (this.totalPrice() > 500 || this.totalPrice() === 0 ? 0 : 50));
  readonly finalTotal = computed(() => this.totalPrice() + this.shipping());

  readonly updatingItems = signal<Set<string>>(new Set());
  readonly isClearing = signal(false);
  readonly isSyncing = signal(false);

  // Track products that have been modified locally but not yet synced to server
  private dirtyProductIds = new Set<string>();

  // ─── Quantity update ────────────────────────────────────────────────────────

  updateQuantity(productId: string | undefined, currentQty: number, delta: number): void {
    if (!productId) return;

    const newQty = currentQty + delta;
    if (newQty < 1) return;

    // Apply optimistic update immediately so the UI responds without lag
    this.cartService.optimisticallyUpdateQuantity(productId, newQty);

    // Track this product as "dirty" so we know to sync it later
    this.dirtyProductIds.add(productId);
  }

  /**
   * Syncs all pending local changes to the server.
   */
  private syncPendingChanges(): Observable<void> {
    if (this.dirtyProductIds.size === 0) {
      return of(undefined);
    }

    this.isSyncing.set(true);

    // Collect all unique dirty products and their latest local quantities
    const updates = Array.from(this.dirtyProductIds).map((id) => {
      const item = this.items().find((p) => p.product._id === id);
      return { productId: id, quantity: item?.quantity || 1 };
    });

    return this.cartService.updateItems(updates).pipe(
      finalize(() => this.isSyncing.set(false)),
      switchMap(() => {
        this.dirtyProductIds.clear();
        return of(undefined);
      })
    );
  }

  // ─── Proceed to Checkout ───────────────────────────────────────────────────

  proceedToCheckout(): void {
    if (this.isSyncing()) return;

    this.syncPendingChanges().subscribe({
      next: () => this.router.navigate(['/orders/checkout']),
      error: () => {
        this.toastService.error('Some changes failed to sync. Please check your cart.');
      },
    });
  }

  // ─── Remove / Clear ─────────────────────────────────────────────────────────

  removeItem(productId: string | undefined): void {
    if (!productId || this.updatingItems().has(productId)) return;

    // Remove from dirty list if it was there
    this.dirtyProductIds.delete(productId);

    const previousCart = this.cart();
    this.updatingItems.update((set) => new Set(set).add(productId));

    this.cartService.removeItem(productId).subscribe({
      next: () => this.toastService.success('Item removed from cart'),
      error: () => {
        if (previousCart) this.cartService.revertCart(previousCart);
        this.toastService.error('Failed to remove item');
        this.clearUpdatingStatus(productId);
      },
      complete: () => this.clearUpdatingStatus(productId),
    });
  }

  clearCart(): void {
    if (this.isClearing()) return;
    this.isClearing.set(true);
    this.dirtyProductIds.clear();

    this.cartService.clearCart().subscribe({
      next: () => this.toastService.success('Cart cleared'),
      error: () => {
        this.toastService.error('Failed to clear cart');
        this.isClearing.set(false);
      },
      complete: () => this.isClearing.set(false),
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  isItemUpdating(productId: string | undefined): boolean {
    if (!productId) return false;
    return this.updatingItems().has(productId);
  }

  private clearUpdatingStatus(productId: string | undefined): void {
    if (!productId) return;
    this.updatingItems.update((set) => {
      const next = new Set(set);
      next.delete(productId);
      return next;
    });
  }

  ngOnDestroy(): void {
    // Sync any leftover changes if the user navigates away
    if (this.dirtyProductIds.size > 0) {
      this.syncPendingChanges();
    }
  }
}
