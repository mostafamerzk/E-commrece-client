import { Component, inject, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  readonly cart = this.cartService.cart;
  readonly items = this.cartService.items;
  readonly totalPrice = this.cartService.totalPrice;
  readonly itemCount = this.cartService.itemCount;

  // For visual consistency with checkout, let's add shipping/total computer signals
  readonly shipping = computed(() => (this.totalPrice() > 500 || this.totalPrice() === 0 ? 0 : 50));
  readonly finalTotal = computed(() => this.totalPrice() + this.shipping());

  updateQuantity(productId: string, currentQty: number, delta: number) {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    this.cartService.updateQuantity(productId, { quantity: newQty }).subscribe({
      next: () => this.toastService.success('Quantity updated'),
      error: () => this.toastService.error('Failed to update quantity'),
    });
  }

  removeItem(productId: string) {
    this.cartService.removeItem(productId).subscribe({
      next: () => this.toastService.success('Item removed from cart'),
      error: () => this.toastService.error('Failed to remove item'),
    });
  }

  clearCart() {
    this.cartService.clearCart().subscribe({
      next: () => this.toastService.success('Cart cleared'),
      error: () => this.toastService.error('Failed to clear cart'),
    });
  }
}
