import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
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
import { AuthService } from '../../../../core/services/auth.service';
import {
  CheckoutSummary,
  OrderResponse,
  PaymentMethod,
  ShippingAddress,
} from '../../../../core/models/order.model';
import { PaymentService } from '../../../../core/services/payment.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryService } from '../../../../core/services/category.service';
import { Address } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private categoryService = inject(CategoryService);
  private paymentService = inject(PaymentService);
  public authService = inject(AuthService);
  private router = inject(Router);

  readonly isPlacingOrder = signal(false);
  readonly isRedirecting = signal(false);
  readonly isApplyingCoupon = signal(false);
  readonly couponError = signal<string | null>(null);
  readonly couponSuccess = signal<string | null>(null);
  readonly checkoutSummary = signal<CheckoutSummary | null>(null);
  readonly apiError = signal<string | null>(null);

  readonly user = this.authService.currentUser;
  readonly paymentMethod = signal<PaymentMethod>('creditCard');
  readonly cartItems = this.cartService.items;

  couponCode = '';

  readonly subtotal = computed(
    () => this.checkoutSummary()?.subtotal ?? this.cartService.totalPrice()
  );
  readonly discount = computed(() => this.checkoutSummary()?.discount ?? 0);
  readonly shipping = computed(() => this.checkoutSummary()?.shipping ?? 0);
  readonly total = computed(
    () => this.checkoutSummary()?.total ?? this.subtotal() - this.discount() + this.shipping()
  );

  shippingForm = new FormGroup({
    phone: new FormControl('', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]),
    street: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    country: new FormControl('Egypt', Validators.required),
    postalCode: new FormControl('', Validators.required),
    saveAddress: new FormControl(false),
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
    this.categoryService.loadCategories();
    if (this.cartItems().length === 0) {
      this.cartService.getCart().subscribe();
    }
    this.updateCheckoutSummary();

    this.shippingForm.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        if (this.shippingForm.valid) this.updateCheckoutSummary();
      });

    toObservable(this.user).subscribe((u) => {
      if (u && Array.isArray(u.address) && u.address.length > 0) {
        if (!this.shippingForm.get('street')?.value) {
          this.onSelectSavedAddress(u.address[0]);
        }
      } else if (u) {
        this.shippingForm.patchValue({ phone: u.phone ?? '' });
      }
    });
  }

  onSelectSavedAddress(address: Address): void {
    this.shippingForm.patchValue({
      street: address.street,
      city: address.city,
      country: address.country || 'Egypt',
      postalCode: address.postalCode || '',
      phone: address.phone || this.user()?.phone || '',
    });
    this.updateCheckoutSummary();
  }

  onSelectSavedAddressByIndex(index: string): void {
    const addresses = this.user()?.address;
    if (addresses && addresses[+index]) {
      this.onSelectSavedAddress(addresses[+index]);
    }
  }

  updateCheckoutSummary(): void {
    const val = this.shippingForm.value;
    const hasAddress = val.street || val.city || val.phone;

    const address = hasAddress
      ? {
          street: val.street || '',
          city: val.city || '',
          country: val.country || 'Egypt',
          phone: val.phone || '',
          postalCode: val.postalCode || '',
        }
      : undefined;

    this.orderService
      .checkout({
        couponCode: this.couponCode || undefined,
        shippingAddress: address as Partial<ShippingAddress>,
      })
      .subscribe({
        next: (res) => this.checkoutSummary.set(res),
        error: (err) => console.error('Checkout summary error:', err),
      });
  }

  applyCoupon(): void {
    if (!this.couponCode) return;
    this.isApplyingCoupon.set(true);
    this.couponError.set(null);
    this.couponSuccess.set(null);

    const val = this.shippingForm.value;
    const hasPartialAddress = val.street || val.city || val.phone;

    const address = hasPartialAddress
      ? {
          street: val.street || '',
          city: val.city || '',
          country: val.country || 'Egypt',
          phone: val.phone || '',
          postalCode: val.postalCode || '',
        }
      : undefined;

    this.orderService
      .checkout({
        couponCode: this.couponCode,
        shippingAddress: address as Partial<ShippingAddress>,
      })
      .subscribe({
        next: (res) => {
          this.checkoutSummary.set(res);
          this.isApplyingCoupon.set(false);

          if (res.discount > 0) {
            this.couponSuccess.set('Coupon applied successfully!');
            this.couponError.set(null);
          } else {
            this.couponSuccess.set(null);
            this.couponError.set('This code is not valid for the items in your cart');
          }
        },
        error: (err) => {
          this.isApplyingCoupon.set(false);
          this.couponSuccess.set(null);
          this.couponError.set(err.error?.message || 'Invalid coupon code');
          this.couponCode = ''; // Reset code on error
        },
      });
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.couponSuccess.set(null);
    this.couponError.set(null);
    this.updateCheckoutSummary();
  }

  placeOrder(): void {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      this.toastService.error('Please fix the errors in the form');
      return;
    }

    this.isPlacingOrder.set(true);
    this.apiError.set(null);

    const val = this.shippingForm.value;
    const address: ShippingAddress = {
      street: val.street!,
      city: val.city!,
      country: val.country!,
      phone: val.phone!,
      postalCode: val.postalCode || '',
    };

    const paymentMethod = this.paymentMethod();

    this.orderService
      .placeOrder({
        paymentMethod,
        shippingAddress: address,
        couponCode: this.couponCode || undefined,
      })
      .subscribe({
        next: async (res: OrderResponse) => {
          if (val.saveAddress && this.authService.isLoggedIn()) {
            try {
              await this.authService.updateProfile({
                address: {
                  street: address.street,
                  city: address.city,
                  country: address.country,
                  postalCode: address.postalCode,
                  phone: address.phone,
                },
              });
              this.toastService.success('Address saved to profile');
            } catch (error) {
              console.error('Failed to save address:', error);
            }
          }

          if (paymentMethod === 'cod') {
            this.toastService.success('Order placed successfully!');
            this.cartService.clearCart().subscribe();
            this.router.navigate(['/payment/success']);
          } else if (paymentMethod === 'creditCard') {
            this.isRedirecting.set(true);
            this.paymentService.createCheckoutSession(res.order._id).subscribe({
              next: (paymentRes) => {
                window.location.href = paymentRes.url;
              },
              error: (err) => {
                this.isRedirecting.set(false);
                this.isPlacingOrder.set(false);
                this.apiError.set(err.error?.message || 'Failed to create payment session');
                this.toastService.error('Error creating payment session');
              },
            });
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

  getCategoryName(id: string): string {
    return this.categoryService.getCategoryName(id);
  }
}
