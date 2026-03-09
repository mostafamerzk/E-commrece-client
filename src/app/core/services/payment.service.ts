import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Observable } from 'rxjs';

interface CheckoutSessionResponse {
  message: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private api = inject(ApiService);
  private readonly endpoint = API_ENDPOINTS.PAYMENT;

  /**
   * Generates a Stripe Checkout Session URL for the given order.
   * @param orderId The ID of the order to create a session for.
   */
  createCheckoutSession(orderId: string): Observable<CheckoutSessionResponse> {
    return this.api.post<CheckoutSessionResponse, { orderId: string }>(
      `${this.endpoint}/create-checkout-session`,
      { orderId }
    );
  }
}
