import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  CheckoutPayload,
  CheckoutSummary,
  OrderResponse,
  PlaceOrderPayload,
} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private api = inject(ApiService);
  private readonly endpoint = API_ENDPOINTS.ORDERS;

  /**
   * Post checkout data to get a price summary (subtotal, shipping, discount, total)
   * before the user actually places the order.
   */
  checkout(payload: CheckoutPayload): Observable<CheckoutSummary> {
    return this.api.post<CheckoutSummary, CheckoutPayload>(`${this.endpoint}/checkout`, payload);
  }

  /**
   * Finalize the order placement with payment method and shipping address.
   */
  placeOrder(payload: PlaceOrderPayload): Observable<OrderResponse> {
    return this.api.post<OrderResponse, PlaceOrderPayload>(this.endpoint, payload);
  }

  /**
   * Retrieve all orders for the currently authenticated user.
   */
  // getUserOrders(params?:string): Observable<OrdersResponse> {
  //   return this.api.get<OrdersResponse>(this.endpoint, params);
  // }

  /**
   * Fetch details for a specific order by its unique ID.
   */
  getById(id: string): Observable<OrderResponse> {
    return this.api.get<OrderResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Request to cancel a pending or confirmed order.
   */
  cancelOrder(id: string): Observable<OrderResponse> {
    return this.api.patch<OrderResponse, object>(`${this.endpoint}/${id}/cancel`, {});
  }
}
