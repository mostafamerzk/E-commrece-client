import { Component, input, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
/* 
import { DiscountPricePipe } from '../../../pipes/discount-price.pipe';
 */
// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CurrencyPipe,
    ButtonModule,
    RatingModule,
    BadgeModule,
    //DiscountPricePipe
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  // Inputs (Angular 20 signal inputs)
  product = input.required<Product>();

  // Local state
  readonly isAddingToCart = signal(false);
  readonly isAddingToWishlist = signal(false);
  // Injected services
  private cart = inject(CartService);
  private wishlist = inject(WishlistService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  // Core signals for roles
  readonly isAdmin = this.authService.isAdmin;
  readonly isSeller = this.authService.isSeller;
  readonly currentUser = this.authService.currentUser;

  // Local state for menu
  readonly isMenuOpen = signal(false);

  // Computed permissions
  readonly isOwner = computed(() => {
    const user = this.currentUser();
    return !!user && user._id === this.product().sellerId;
  });

  readonly canManage = computed(() => this.isOwner());

  // Computed state
  readonly isWishlisted = computed(() =>
    this.wishlist.items().some((p) => p._id === this.product()._id)
  );

  readonly isInCart = computed(() =>
    this.cart.items().some((item) => item.product._id === this.product()._id)
  );
  addToCart(event: Event): void {
    event.stopPropagation();
    if (this.product().stock === 0 || this.isInCart()) return;

    this.isAddingToCart.set(true);
    this.cart.addItem({ productId: this.product()._id, quantity: 1 }, this.product()).subscribe({
      next: () => {
        // Success handling (Toast is usually handled by CartService or Interceptor)
        this.isAddingToCart.set(false);
      },
      error: () => {
        this.isAddingToCart.set(false);
      },
    });
  }

  removeFromCart(event: Event): void {
    event.stopPropagation();
    this.isAddingToCart.set(true);
    this.cart
      .removeItem(this.product()._id)
      .pipe(finalize(() => this.isAddingToCart.set(false)))
      .subscribe();
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    this.wishlist.toggleWishlist(this.product()._id, this.product()).subscribe();
  }
  navigateToDetail(): void {
    this.router.navigate(['/products', this.product()._id]);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen.update((prev) => !prev);
  }

  @HostListener('document:click')
  closeMenu(): void {
    if (this.isMenuOpen()) {
      this.isMenuOpen.set(false);
    }
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen.set(false);
    // Placeholder for now as per instructions
    this.toast.info('Edit Product feature coming soon!', 'Info');
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen.set(false);

    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.delete(this.product()._id, false).subscribe({
        next: () => {
          this.toast.success('Product deleted successfully', 'Success');
          this.product().isDeleted = true;
        },
        error: (err) => {
          this.toast.error(err.message || 'Failed to delete product', 'Error');
        },
      });
    }
  }

  onRecover(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen.set(false);

    this.productService.restore(this.product()._id, false).subscribe({
      next: () => {
        this.toast.success('Product restored successfully', 'Success');
        this.product().isDeleted = false;
      },
      error: (err) => {
        this.toast.error(err.message || 'Failed to restore product', 'Error');
      },
    });
  }
}
