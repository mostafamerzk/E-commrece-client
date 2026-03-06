import { Component, input, signal, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/product.model';
// Assume these exist as per instructions
import { CartService } from '../../../core/services/cart.service';
/* 
import { WishlistService } from '../../../../core/services/wishlist.service';
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

  // Injected services
  private cart = inject(CartService);
  //private wishlist = inject(WishlistService);
  private router = inject(Router);

  // Computed state
  readonly isWishlisted = computed(
    () =>
      //this.wishlist.items().some(p => p._id === this.product()._id)
      false
  );

  addToCart(event: Event): void {
    event.stopPropagation();
    if (this.product().stock === 0) return;

    this.isAddingToCart.set(true);
    this.cart.addToCart(this.product()._id, 1).subscribe({
      next: () => {
        // Success handling (Toast is usually handled by CartService or Interceptor)
        this.isAddingToCart.set(false);
      },
      error: () => {
        this.isAddingToCart.set(false);
      },
    });
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    //this.wishlist.toggle(this.product()._id);
  }

  navigateToDetail(): void {
    this.router.navigate(['/products', this.product()._id]);
  }
}
