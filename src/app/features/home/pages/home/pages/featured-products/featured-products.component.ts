import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../../../../core/services/product.service';
import { WishlistService } from '../../../../../../core/services/wishlist.service';
import { Product } from '../../../../../../core/models/product.model';
import { ProductCardComponent } from '../../../../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.scss',
})
export class ProductsSectionComponent implements OnInit {
  private productService = inject(ProductService);
  private wishlistService = inject(WishlistService);

  products = signal<Product[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  error = signal(false);

  private currentPage = 1;
  private totalPages = 1;

  get hasMore(): boolean {
    return this.currentPage < this.totalPages;
  }

  ngOnInit(): void {
    this.wishlistService.getWishlist().subscribe({
      next: () => this.loadProducts(1, true),
      error: () => this.loadProducts(1, true),
    });
  }

  private loadProducts(page: number, initial = false): void {
    initial ? this.loading.set(true) : this.loadingMore.set(true);

    this.productService.getFeatured(page).subscribe({
      next: (res) => {
        this.products.update((current) => (initial ? res.products : [...current, ...res.products]));
        this.currentPage = res.pagination.currentPage;
        this.totalPages = res.pagination.totalPages;
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }

  loadMore(): void {
    if (!this.hasMore || this.loadingMore()) return;
    this.loadProducts(this.currentPage + 1);
  }
}
