// ─────────────────────────────────────────────────────────────────────────────
// payment.model.ts
//
// Covers: Stripe payment integration from the /payment endpoint.
// Used by: PaymentService, PlaceOrderComponent (redirects to Stripe),
//          PaymentSuccessComponent, PaymentCancelComponent.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Request Payloads ─────────────────────────────────────────────────────────

/**
 * Body sent to POST /payment/create-checkout-session.
 * The backend uses the orderId to look up the order details and create
 * the corresponding Stripe checkout session.
 */
export interface CreateCheckoutSessionPayload {
  orderId: string;
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

/**
 * Response from POST /payment/create-checkout-session.
 *
 * The `url` field is a Stripe-hosted checkout page URL.
 * The PaymentService should redirect the user to this URL immediately:
 *   window.location.href = response.url;
 *
 * After the user completes or cancels payment on Stripe's side,
 * Stripe redirects them back to your app's success or cancel URL
 * (configured in the backend's Stripe settings).
 */
export interface CheckoutSessionResponse {
  message: string;
  // Full Stripe checkout URL, e.g. "https://checkout.stripe.com/pay/cs_test_..."
  url: string;
}
