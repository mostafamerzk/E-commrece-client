import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CheckoutSummary, ShippingAddress } from '../../../../core/models/order.model';

interface PlaceOrderResponse {
  session?: { url: string };
  order?: { _id: string };
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  readonly isPlacingOrder = signal(false);
  readonly isApplyingCoupon = signal(false);
  readonly couponError = signal<string | null>(null);
  readonly couponSuccess = signal<string | null>(null);
  readonly checkoutSummary = signal<CheckoutSummary | null>(null);
  readonly apiError = signal<string | null>(null);

  couponCode = '';

  readonly cartItems = this.cartService.items;

  readonly subtotal = computed(() =>
    this.cartItems().reduce((s, i) => s + i.price * i.quantity, 0)
  );
  readonly discount = computed(() => this.checkoutSummary()?.discount ?? 0);
  readonly shipping = computed(() => this.checkoutSummary()?.shipping ?? 0);
  readonly total = computed(() => this.subtotal() - this.discount() + this.shipping());

  shippingForm = new FormGroup({
    recipientName: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]),
    address: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    postalCode: new FormControl(''),
  });

  readonly egyptianCities = [
    'Cairo',
    'Alexandria',
    'Giza',
    'Port Said',
    'Suez',
    'Luxor',
    'Aswan',
    'Mansoura',
    'Tanta',
    'Zagazig',
  ];

  ngOnInit() {
    if (this.cartItems().length === 0) {
      this.cartService.getCart().subscribe();
    }
    this.updateCheckoutSummary();
  }

  updateCheckoutSummary() {
    this.orderService
      .checkout({
        couponCode: this.couponCode || undefined,
        shippingAddress: this.shippingForm.value as Partial<ShippingAddress>,
      })
      .subscribe({
        next: (res) => this.checkoutSummary.set(res),
        error: (err) => console.error('Checkout summary error:', err),
      });
  }

  applyCoupon() {
    if (!this.couponCode) return;
    this.isApplyingCoupon.set(true);
    this.couponError.set(null);
    this.couponSuccess.set(null);

    this.orderService
      .checkout({
        couponCode: this.couponCode,
        shippingAddress: this.shippingForm.value as Partial<ShippingAddress>,
      })
      .subscribe({
        next: (res) => {
          this.checkoutSummary.set(res);
          this.couponSuccess.set('Coupon applied successfully!');
          this.isApplyingCoupon.set(false);
        },
        error: (err) => {
          this.couponError.set(err.error?.message || 'Invalid coupon code');
          this.isApplyingCoupon.set(false);
        },
      });
  }

  placeOrder() {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      this.toastService.error('Please fix the errors in the form');
      return;
    }
    this.isPlacingOrder.set(true);
    this.apiError.set(null);

    this.orderService
      .placeOrder({
        paymentMethod: 'card',
        shippingAddress: this.shippingForm.value as ShippingAddress,
        couponCode: this.couponCode || undefined,
      })
      .subscribe({
        next: (res: PlaceOrderResponse) => {
          if (res.session?.url) {
            window.location.href = res.session.url;
          } else if (res.order?._id) {
            this.toastService.success('Order placed! Redirecting to payment...');
          }
        },
        error: (err) => {
          this.apiError.set(err.error?.message || 'Failed to place order');
          this.isPlacingOrder.set(false);
          this.toastService.error('Could not place order. Please try again.');
        },
      });
  }

  fieldInvalid(field: string): boolean {
    const control = this.shippingForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
