import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);

  readonly items = this.wishlistService.items;
  readonly itemCount = this.wishlistService.itemCount;
  readonly loading = signal(false);
  readonly removingIds = signal<Set<string>>(new Set());
  readonly addingToCartIds = signal<Set<string>>(new Set());
  readonly isEmpty = computed(() => this.items().length === 0);

  ngOnInit(): void {
    this.loading.set(true);
    this.wishlistService.getWishlist().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  // ✅ removeFromWishlist بتستخدم toggleWishlist اللي بيعمل DELETE لأن المنتج موجود
  removeFromWishlist(product: Product): void {
    this.removingIds.update((s) => new Set(s).add(product._id));
    this.wishlistService.toggleWishlist(product._id).subscribe({
      next: () => {
        this.removingIds.update((s) => {
          const next = new Set(s);
          next.delete(product._id);
          return next;
        });
      },
      error: () => {
        this.removingIds.update((s) => {
          const next = new Set(s);
          next.delete(product._id);
          return next;
        });
      },
    });
  }

  addToCart(product: Product): void {
    if (this.cartService.isInCart(product._id)) return;
    this.addingToCartIds.update((s) => new Set(s).add(product._id));
    this.cartService.addItem({ productId: product._id }, product).subscribe({
      next: () => {
        this.addingToCartIds.update((s) => {
          const next = new Set(s);
          next.delete(product._id);
          return next;
        });
      },
      error: () => {
        this.addingToCartIds.update((s) => {
          const next = new Set(s);
          next.delete(product._id);
          return next;
        });
      },
    });
  }

  isRemoving(id: string): boolean {
    return this.removingIds().has(id);
  }

  isAddingToCart(id: string): boolean {
    return this.addingToCartIds().has(id);
  }

  getStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }

  trackByProduct(_: number, product: Product): string {
    return product._id;
  }
}
