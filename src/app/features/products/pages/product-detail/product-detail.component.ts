import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map, finalize } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastService } from '../../../../core/services/toast.service';

// PrimeNG Imports
import { GalleriaModule } from 'primeng/galleria';
import { RatingModule } from 'primeng/rating';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { BreadcrumbModule } from 'primeng/breadcrumb';

// Shared Components
import { ReviewsSectionComponent } from '../../../../shared/components/reviews-section/reviews-section.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CurrencyPipe,
    DecimalPipe,
    GalleriaModule,
    RatingModule,
    InputNumberModule,
    ButtonModule,
    SkeletonModule,
    BreadcrumbModule,
    ReviewsSectionComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cart = inject(CartService);
  private categoryService = inject(CategoryService);
  private wishlist = inject(WishlistService);
  private toast = inject(ToastService);

  // ID from Route
  readonly productId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id')!)));

  // State Signals
  product = signal<Product | null>(null);
  categoryName = signal<string>('Loading...');
  isLoading = signal(true);
  quantity = signal(1);
  isAddingToCart = signal(false);
  private lastInitializedProductId = '';

  // Computed State
  readonly isWishlisted = computed(() =>
    this.wishlist.items().some((p) => p._id === this.product()?._id)
  );

  readonly breadcrumb = computed(() => [
    { label: 'Products', routerLink: '/products' },
    { label: this.product()?.title || 'Loading...' },
  ]);

  readonly discountPercent = computed(() => {
    const p = this.product();
    if (!p?.discount) return 0;
    return p.discount;
  });

  readonly galleryImages = computed(() => {
    const p = this.product();
    if (!p) return [];

    const images = [{ src: p.mainImage.secure_url, alt: p.title }];
    if (p.images) {
      images.push(...p.images.map((img) => ({ src: img.secure_url, alt: p.title })));
    }
    return images;
  });
  isInCart = computed(() => {
    const p = this.product();
    if (!p) return false;
    return this.cart.isInCart(p._id);
  });
  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });

    // Effect to sync quantity once both product and cart items are ready
    effect(() => {
      const p = this.product();
      const cart = this.cart.cart(); // Ensures we wait for cart signal to be initialized
      const items = this.cart.items();

      if (p && cart) {
        // Only initialize once per product change to avoid overwriting user edits later
        if (this.lastInitializedProductId !== p._id) {
          const cartItem = items.find((item) => item.product._id === p._id);
          this.quantity.set(cartItem?.quantity ?? 1);
          this.lastInitializedProductId = p._id;
        }
      }
    });
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);
    this.productService
      .getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.product.set(res.product);
          this.loadCategoryName(res.product.categoryId);
        },
        error: (err) => {
          console.error('Error loading product', err);
          // If it's not a 404, we don't necessarily want to redirect.
          // But for 404, we go to the not-found page.
          if (err.status === 404) {
            this.router.navigate(['/404']);
          }
        },
      });
  }

  private loadCategoryName(categoryId: string): void {
    this.categoryService.getById(categoryId).subscribe({
      next: (res) => this.categoryName.set(res.category.name),
      error: () => this.categoryName.set('Unknown Category'),
    });
  }

  addToCart(): void {
    const p = this.product();
    if (!p || p.stock === 0) return;

    const currentlyInCart = this.isInCart();
    this.isAddingToCart.set(true);

    const request$ = currentlyInCart
      ? this.cart.updateQuantity(p._id, { quantity: this.quantity() }, p)
      : this.cart.addItem({ productId: p._id, quantity: this.quantity() }, p);

    request$.subscribe({
      next: () => {
        this.isAddingToCart.set(false);
        this.toast.success(
          currentlyInCart ? 'Cart quantity updated!' : 'Successfully added to cart!'
        );
      },
      error: () => {
        this.isAddingToCart.set(false);
        this.toast.error('Failed to update cart!');
      },
    });
  }
  // updateQuantity(): void {
  //   const p = this.product();
  //   if (!p) return;

  //   this.isAddingToCart.set(true);
  //   this.cart
  //     .updateQuantity(p._id, { quantity: this.quantity() })
  //     .pipe(finalize(() => this.isAddingToCart.set(false)))
  //     .subscribe({
  //       next: () => {
  //         this.toast.success('Cart quantity updated!');
  //         console.log(this.isInCart(), this.quantity());
  //       },
  //       error: () => {
  //         this.toast.error('Failed to update cart!');
  //       },
  //     });
  // }
  toggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    this.wishlist.toggleWishlist(p._id);
  }

  removeFromCart(): void {
    const p = this.product();
    if (!p) return;

    this.cart.removeItem(p._id).subscribe({
      next: () => {
        this.toast.success('Item removed from cart');
      },
      error: () => {
        this.toast.error('Failed to remove item');
      },
    });
  }
}
