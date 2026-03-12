import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ProductCardComponent } from './product-card.component';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.model';
import { Cart, CartItem, CartResponse } from '../../../core/models/cart.model';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let cartServiceMock: jasmine.SpyObj<CartService>;
  let wishlistServiceMock: jasmine.SpyObj<WishlistService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    _id: '123',
    title: 'Test Product',
    price: 100,
    finalPrice: 80,
    discount: 20,
    stock: 10,
    avgRating: 4.5,
    mainImage: { secure_url: 'test.jpg', public_id: 'test' },
    description: 'Test description',
    slug: 'test-product',
    categoryId: 'cat123',
    images: [],
    sellerId: '12',
    isDeleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const cartItemsSignal: WritableSignal<CartItem[]> = signal([]);
  const wishlistItemsSignal: WritableSignal<Product[]> = signal([]);

  beforeEach(async () => {
    cartServiceMock = jasmine.createSpyObj('CartService', ['addItem', 'removeItem']);
    (cartServiceMock as unknown as { items: WritableSignal<CartItem[]> }).items = cartItemsSignal;

    wishlistServiceMock = jasmine.createSpyObj('WishlistService', ['toggleWishlist']);
    (wishlistServiceMock as unknown as { items: WritableSignal<Product[]> }).items =
      wishlistItemsSignal;

    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: CartService, useValue: cartServiceMock },
        { provide: WishlistService, useValue: wishlistServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should identify if product is in wishlist', () => {
    wishlistItemsSignal.set([{ _id: '123' } as Product]);
    fixture.detectChanges();
    expect(component.isWishlisted()).toBeTrue();

    wishlistItemsSignal.set([]);
    fixture.detectChanges();
    expect(component.isWishlisted()).toBeFalse();
  });

  it('should identify if product is in cart', () => {
    cartItemsSignal.set([{ product: { _id: '123' } } as CartItem]);
    fixture.detectChanges();
    expect(component.isInCart()).toBeTrue();

    cartItemsSignal.set([]);
    fixture.detectChanges();
    expect(component.isInCart()).toBeFalse();
  });

  it('should call cart.addItem when adding to cart', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    cartServiceMock.addItem.and.returnValue(
      of({ message: 'Success', cart: {} as Cart } as CartResponse)
    );

    component.addToCart(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(cartServiceMock.addItem).toHaveBeenCalledWith(
      { productId: '123', quantity: 1 },
      mockProduct
    );
  });

  it('should call wishlist.toggleWishlist when toggling wishlist', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    wishlistServiceMock.toggleWishlist.and.returnValue(of({ message: 'Success', wishlist: [] }));

    component.toggleWishlist(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(wishlistServiceMock.toggleWishlist).toHaveBeenCalledWith('123', mockProduct);
  });

  it('should navigate to detail page when clicked', () => {
    component.navigateToDetail();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products', '123']);
  });
});
