import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CartComponent } from './cart.component';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CartItem } from '../../../../core/models/cart.model';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let cartServiceMock: any;
  let toastServiceMock: any;

  const mockCartItems: CartItem[] = [
    {
      product: {
        _id: '1',
        title: 'Product 1',
        price: 100,
        finalPrice: 100,
        mainImage: { secure_url: 'img1.jpg', public_id: '1' },
        category: {
          name: 'Cat 1',
          _id: 'cat1',
          slug: 'cat-1',
          image: { secure_url: '', public_id: '' },
        },
        stock: 10,
        avgRating: 4,
        description: 'desc',
        slug: 'p1',
      } as any,
      /* eslint-enable @typescript-eslint/no-explicit-any */
      quantity: 2,
      price: 100,
    },
  ];

  beforeEach(async () => {
    cartServiceMock = {
      cart: signal({ userId: 'u1', products: mockCartItems, totalPrice: 200 }),
      items: signal(mockCartItems),
      totalPrice: signal(200),
      itemCount: signal(2),
      updateQuantity: jasmine.createSpy('updateQuantity').and.returnValue(of({})),
      removeItem: jasmine.createSpy('removeItem').and.returnValue(of({})),
      clearCart: jasmine.createSpy('clearCart').and.returnValue(of({})),
    };

    toastServiceMock = {
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error'),
    };

    await TestBed.configureTestingModule({
      imports: [CartComponent, RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: CartService, useValue: cartServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display items from CartService', () => {
    expect(component.items()).toEqual(mockCartItems);
  });

  it('should call updateQuantity when delta is provided', () => {
    component.updateQuantity('1', 2, 1);
    expect(cartServiceMock.updateQuantity).toHaveBeenCalledWith('1', { quantity: 3 });
    expect(toastServiceMock.success).toHaveBeenCalledWith('Quantity updated');
  });

  it('should not call updateQuantity when new quantity would be less than 1', () => {
    component.updateQuantity('1', 1, -1);
    expect(cartServiceMock.updateQuantity).not.toHaveBeenCalled();
  });

  it('should call removeItem when delete is clicked', () => {
    component.removeItem('1');
    expect(cartServiceMock.removeItem).toHaveBeenCalledWith('1');
    expect(toastServiceMock.success).toHaveBeenCalledWith('Item removed from cart');
  });

  it('should call clearCart when clear button is clicked', () => {
    component.clearCart();
    expect(cartServiceMock.clearCart).toHaveBeenCalled();
    expect(toastServiceMock.success).toHaveBeenCalledWith('Cart cleared');
  });

  it('should calculate correct total and shipping', () => {
    // total is 200, so shipping should be 50 (since it's <= 500)
    expect(component.shipping()).toBe(50);
    expect(component.finalTotal()).toBe(250);
  });

  it('should show zero shipping if total is > 500', () => {
    cartServiceMock.totalPrice.set(600);
    fixture.detectChanges();
    expect(component.shipping()).toBe(0);
    expect(component.finalTotal()).toBe(600);
  });
});
