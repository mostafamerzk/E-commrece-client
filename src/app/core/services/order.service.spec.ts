import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrderService } from './order.service';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CheckoutPayload, PlaceOrderPayload, Order } from '../models/order.model';
import { provideZonelessChangeDetection } from '@angular/core';

describe('OrderService', () => {
  let service: OrderService;
  let apiSpy: jasmine.SpyObj<ApiService>;
  const endpoint = API_ENDPOINTS.ORDERS;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'patch']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        OrderService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });

    service = TestBed.inject(OrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('checkout()', () => {
    it('should call POST /order/checkout with payload', () => {
      const payload: CheckoutPayload = { couponCode: 'SAVE10' };
      const mockResponse = { subtotal: 100, shipping: 10, discount: 10, total: 100 };
      apiSpy.post.and.returnValue(of(mockResponse));

      service.checkout(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(apiSpy.post).toHaveBeenCalledWith(`${endpoint}/checkout`, payload);
      });
    });
  });

  describe('placeOrder()', () => {
    it('should call POST /order with payload', () => {
      const payload: PlaceOrderPayload = {
        paymentMethod: 'card',
        shippingAddress: { street: '123 St', city: 'NY', country: 'USA', phone: '123' },
      };
      const mockResponse = { message: 'Success', order: { _id: '1' } as Order };
      apiSpy.post.and.returnValue(of(mockResponse));

      service.placeOrder(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(apiSpy.post).toHaveBeenCalledWith(endpoint, payload);
      });
    });
  });

  describe('getUserOrders()', () => {
    it('should call GET /order with params', () => {
      // const params = { page: 1 };
      const mockResponse = { message: 'Success', orders: [] };
      apiSpy.get.and.returnValue(of(mockResponse));

      //   service.getUserOrders(params).subscribe((res) => {
      //     expect(res).toEqual(mockResponse);
      //     expect(apiSpy.get).toHaveBeenCalledWith(endpoint, params);
      //   });
    });
  });

  describe('getById()', () => {
    it('should call GET /order/:id', () => {
      const id = '123';
      const mockResponse = { message: 'Success', order: { _id: id } as Order };
      apiSpy.get.and.returnValue(of(mockResponse));

      service.getById(id).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(apiSpy.get).toHaveBeenCalledWith(`${endpoint}/${id}`);
      });
    });
  });

  describe('cancelOrder()', () => {
    it('should call PATCH /order/:id/cancel', () => {
      const id = '123';
      const mockResponse = { message: 'Cancelled', order: { _id: id } as Order };
      apiSpy.patch.and.returnValue(of(mockResponse));

      service.cancelOrder(id).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(apiSpy.patch).toHaveBeenCalledWith(`${endpoint}/${id}/cancel`, {});
      });
    });
  });
});
