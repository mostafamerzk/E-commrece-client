import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment.prod';
import { AddToCartPayload } from '../models/cart.model';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        CartService,
      ],
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get cart and update signal', () => {
    const mockCart = { userId: '1', products: [], totalPrice: 0 };
    const mockResponse = { message: 'Success', cart: mockCart };

    service.getCart().subscribe((res) => {
      expect(res.cart).toEqual(mockCart);
      expect(service.cart()).toEqual(mockCart);
    });

    const req = httpMock.expectOne(`${baseUrl}${API_ENDPOINTS.CART}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should add item and update signal', () => {
    const payload: AddToCartPayload = { productId: 'p1', quantity: 2 };
    const mockCart = {
      userId: '1',
      products: [{ productId: 'p1', quantity: 2, price: 50 }],
      totalPrice: 100,
    };
    const mockResponse = { message: 'Added', cart: mockCart };

    service.addItem(payload).subscribe(() => {
      expect(service.cart()).toEqual(mockCart);
      expect(service.itemCount()).toBe(2);
      expect(service.totalPrice()).toBe(100);
    });

    const req = httpMock.expectOne(`${baseUrl}${API_ENDPOINTS.CART}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should update quantity', () => {
    const productId = 'p1';
    const payload = { quantity: 5 };
    const mockCart = {
      userId: '1',
      products: [{ productId: 'p1', quantity: 5, price: 50 }],
      totalPrice: 250,
    };
    const mockResponse = { message: 'Updated', cart: mockCart };

    service.updateQuantity(productId, payload).subscribe(() => {
      expect(service.cart()).toEqual(mockCart);
    });

    const req = httpMock.expectOne(`${baseUrl}${API_ENDPOINTS.CART}/${productId}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });

  it('should remove item', () => {
    const productId = 'p1';
    const mockCart = { userId: '1', products: [], totalPrice: 0 };
    const mockResponse = { message: 'Removed', cart: mockCart };

    service.removeItem(productId).subscribe(() => {
      expect(service.cart()).toEqual(mockCart);
    });

    const req = httpMock.expectOne(`${baseUrl}${API_ENDPOINTS.CART}/${productId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should clear cart', () => {
    const mockResponse = { message: 'Cleared' };

    service.clearCart().subscribe(() => {
      expect(service.cart()).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}${API_ENDPOINTS.CART}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
