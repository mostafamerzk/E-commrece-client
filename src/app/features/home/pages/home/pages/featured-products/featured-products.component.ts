import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HomeService } from '../../../../../../core/services/home.service';
import { CartService } from '../../../../../../core/services/cart.service';
import { WishlistService } from '../../../../../../core/services/wishlist.service';
import { Product } from '../../../../../../core/models/product.model';
import { Pagination } from '../../../../../../core/models/shared.model';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.scss',
})
export class FeaturedProductsComponent implements OnInit {
  private homeService = inject(HomeService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);

  products: Product[] = [];
  pagination: Pagination | null = null;

  loading = true;
  loadingMore = false;
  error = false;

  private currentPage = 1;
  private readonly limit = 8;

  addingToCart = new Set<string>();

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.loadProducts(1, true);
  }

  // ── Load Products ─────────────────────────────────────────
  private loadProducts(page: number, initial = false): void {
    if (initial) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    this.homeService.getFeaturedProducts().subscribe({
      next: (res) => {
        // لو initial نبدل الـ array — لو load more نضيف عليه
        this.products = initial ? res.products : [...this.products, ...res.products];

        this.pagination = res.pagination;
        this.currentPage = res.pagination.currentPage;
        this.loading = false;
        this.loadingMore = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.loadingMore = false;
      },
    });
  }

  // ── Load More ─────────────────────────────────────────────
  loadMore(): void {
    if (!this.hasMore || this.loadingMore) return;
    this.loadProducts(this.currentPage + 1);
  }

  get hasMore(): boolean {
    if (!this.pagination) return false;
    return this.currentPage < this.pagination.totalPages;
  }

  // ── Cart ──────────────────────────────────────────────────
  addToCart(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.cartService.isInCart(product._id)) return;

    this.addingToCart.add(product._id);
    this.cartService.addToCart(product._id).subscribe({
      next: () => this.addingToCart.delete(product._id),
      error: () => this.addingToCart.delete(product._id),
    });
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  isAddingToCart(productId: string): boolean {
    return this.addingToCart.has(productId);
  }

  // ── Wishlist ──────────────────────────────────────────────
  toggleWishlist(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggleWishlist(product._id).subscribe();
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  // ── Helpers ───────────────────────────────────────────────
  getDiscount(product: Product): number {
    return Math.round(product.discount ?? 0);
  }

  getStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }
}
