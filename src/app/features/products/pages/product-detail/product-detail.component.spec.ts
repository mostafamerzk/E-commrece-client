import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Product, ProductResponse } from '../../../../core/models/product.model';
import { Cart, CartItem, CartResponse } from '../../../../core/models/cart.model';
import { CategoryResponse } from '../../../../core/models/category.model';
import { WishlistResponse } from '../../../../core/services/wishlist.service';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productServiceMock: jasmine.SpyObj<ProductService>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;
  let cartServiceMock: jasmine.SpyObj<CartService>;
  let wishlistServiceMock: jasmine.SpyObj<WishlistService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let routerMock: jasmine.SpyObj<Router>;
  let paramMapSubject: BehaviorSubject<ParamMap>;

  const mockProduct: Product = {
    _id: '123',
    title: 'Detail Product',
    price: 1500,
    finalPrice: 1500,
    stock: 5,
    mainImage: { secure_url: 'detail.jpg', public_id: 'detail' },
    description: 'Detailed description',
    categoryId: 'cat456',
    avgRating: 4.8,
    slug: 'detail-p',
    images: [],
    sellerId: '12',
    isDeleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const cartSignal: WritableSignal<Cart | null> = signal({
    userId: 'u1',
    products: [],
    totalPrice: 0,
  });
  const cartItemsSignal: WritableSignal<CartItem[]> = signal([]);
  const wishlistItemsSignal: WritableSignal<Product[]> = signal([]);

  beforeEach(async () => {
    paramMapSubject = new BehaviorSubject<ParamMap>({
      get: (key: string) => (key === 'id' ? '123' : null),
      has: (key: string) => key === 'id',
      getAll: () => [],
      keys: ['id'],
    });

    productServiceMock = jasmine.createSpyObj('ProductService', ['getById']);
    productServiceMock.getById.and.returnValue(of({ product: mockProduct } as ProductResponse));

    categoryServiceMock = jasmine.createSpyObj('CategoryService', ['getById']);
    categoryServiceMock.getById.and.returnValue(
      of({ category: { name: 'Smartphones' } } as unknown as CategoryResponse)
    );

    cartServiceMock = jasmine.createSpyObj('CartService', [
      'isInCart',
      'addItem',
      'updateQuantity',
      'removeItem',
    ]);
    (cartServiceMock as unknown as { cart: WritableSignal<Cart | null> }).cart = cartSignal;
    (cartServiceMock as unknown as { items: WritableSignal<CartItem[]> }).items = cartItemsSignal;
    cartServiceMock.isInCart.and.returnValue(false);

    wishlistServiceMock = jasmine.createSpyObj('WishlistService', ['toggleWishlist']);
    (wishlistServiceMock as unknown as { items: WritableSignal<Product[]> }).items =
      wishlistItemsSignal;

    toastServiceMock = jasmine.createSpyObj('ToastService', ['success', 'error']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProductService, useValue: productServiceMock },
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: WishlistService, useValue: wishlistServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load product data', () => {
    expect(component).toBeTruthy();
    expect(productServiceMock.getById).toHaveBeenCalledWith('123');
    expect(categoryServiceMock.getById).toHaveBeenCalledWith('cat456');
    expect(component.product()).toEqual(mockProduct);
    expect(component.categoryName()).toBe('Smartphones');
  });

  it('should add to cart when not in cart', () => {
    cartServiceMock.isInCart.and.returnValue(false);
    cartServiceMock.addItem.and.returnValue(of({} as CartResponse));

    component.addToCart();

    expect(cartServiceMock.addItem).toHaveBeenCalled();
    expect(toastServiceMock.success).toHaveBeenCalledWith('Successfully added to cart!');
  });

  it('should update quantity when already in cart', () => {
    cartServiceMock.isInCart.and.returnValue(true);
    cartServiceMock.updateQuantity.and.returnValue(of({} as CartResponse));
    fixture.detectChanges();

    component.addToCart();

    expect(cartServiceMock.updateQuantity).toHaveBeenCalled();
    expect(toastServiceMock.success).toHaveBeenCalledWith('Cart quantity updated!');
  });

  it('should toggle wishlist and pass full product', () => {
    wishlistServiceMock.toggleWishlist.and.returnValue(of({} as WishlistResponse));
    component.toggleWishlist();
    expect(wishlistServiceMock.toggleWishlist).toHaveBeenCalledWith('123', mockProduct);
  });

  it('should remove from cart', () => {
    cartServiceMock.removeItem.and.returnValue(of({} as CartResponse));
    component.removeFromCart();
    expect(cartServiceMock.removeItem).toHaveBeenCalledWith('123');
    expect(toastServiceMock.success).toHaveBeenCalledWith('Item removed from cart');
  });

  it('should correctly compute breadcrumb', () => {
    const breadcrumb = component.breadcrumb();
    expect(breadcrumb[1].label).toBe('Detail Product');
  });
});
