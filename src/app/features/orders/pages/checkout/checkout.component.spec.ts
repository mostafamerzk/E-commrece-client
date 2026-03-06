import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CheckoutComponent } from './checkout.component';
import { OrderService } from '../../../../core/services/order.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../core/services/toast.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

interface OrderServiceMock {
  checkout: jasmine.Spy;
  placeOrder: jasmine.Spy;
}

interface CartServiceMock {
  items: ReturnType<typeof signal>;
  getCart: jasmine.Spy;
}

interface ToastServiceMock {
  success: jasmine.Spy;
  error: jasmine.Spy;
}

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let orderServiceMock: OrderServiceMock;
  let cartServiceMock: CartServiceMock;
  let toastServiceMock: ToastServiceMock;

  beforeEach(async () => {
    orderServiceMock = {
      checkout: jasmine
        .createSpy('checkout')
        .and.returnValue(of({ subtotal: 100, shipping: 10, discount: 0, total: 110 })),
      placeOrder: jasmine
        .createSpy('placeOrder')
        .and.returnValue(of({ session: { url: 'http://stripe.com' } })),
    };

    cartServiceMock = {
      items: signal([]),
      getCart: jasmine
        .createSpy('getCart')
        .and.returnValue(of({ message: 'Success', cart: { products: [] } })),
    };

    toastServiceMock = {
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error'),
    };

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: OrderService, useValue: orderServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when shipping address is empty', () => {
    expect(component.shippingForm.valid).toBeFalse();
    component.shippingForm.patchValue({
      recipientName: 'John',
      phone: '01012345678',
      address: 'Street',
      city: 'Cairo',
    });
    expect(component.shippingForm.valid).toBeTrue();
  });

  it('should call checkout() on init', () => {
    expect(orderServiceMock.checkout).toHaveBeenCalled();
  });

  it('should apply coupon successfully', () => {
    component.couponCode = 'SAVE10';
    const mockSummary = { subtotal: 100, shipping: 10, discount: 10, total: 100 };
    orderServiceMock.checkout.and.returnValue(of(mockSummary));

    component.applyCoupon();

    expect(orderServiceMock.checkout).toHaveBeenCalledWith(
      jasmine.objectContaining({ couponCode: 'SAVE10' })
    );
    expect(component.checkoutSummary()).toEqual(mockSummary);
    expect(component.couponSuccess()).toBeTruthy();
  });

  it('should handle coupon error', () => {
    component.couponCode = 'INVALID';
    orderServiceMock.checkout.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid coupon' } }))
    );

    component.applyCoupon();

    expect(component.couponError()).toBe('Invalid coupon');
  });

  it('should place order and redirect to stripe', () => {
    component.shippingForm.patchValue({
      recipientName: 'John',
      phone: '01012345678',
      address: 'Street',
      city: 'Cairo',
    });

    component.placeOrder();

    expect(orderServiceMock.placeOrder).toHaveBeenCalled();
  });

  it('should show error if placeOrder fails', () => {
    component.shippingForm.patchValue({
      recipientName: 'John',
      phone: '01012345678',
      address: 'Street',
      city: 'Cairo',
    });
    orderServiceMock.placeOrder.and.returnValue(
      throwError(() => ({ error: { message: 'Failed' } }))
    );

    component.placeOrder();

    expect(component.apiError()).toBe('Failed');
    expect(toastServiceMock.error).toHaveBeenCalled();
  });
});
