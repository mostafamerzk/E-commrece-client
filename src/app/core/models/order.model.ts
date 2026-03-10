// ─────────────────────────────────────────────────────────────────────────────
// order.model.ts
//
// Covers: Order placement, tracking, and management from the /order endpoint.
// Used by: OrderService, CheckoutComponent, PlaceOrderComponent,
//          OrderListComponent, OrderDetailComponent, AdminOrdersComponent.
// ─────────────────────────────────────────────────────────────────────────────

import { CloudinaryImage, Pagination } from './shared.model';

/**
 * The valid values for an order's current status.
 * Defined as a union type so TypeScript prevents any invalid status string
 * from ever being assigned. The admin panel's status dropdown should
 * only offer these exact values.
 *
 * Flow: pending → confirmed → processing → shipped → delivered
 *                                                  ↘ cancelled (if user cancels)
 *                                                  ↘ returned  (after delivery)
 */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

/**
 * The valid values for payment status.
 * 'unpaid'  → order placed but payment not yet received (cash on delivery, etc.)
 * 'paid'    → payment confirmed (Stripe webhook updated this)
 * 'refunded'→ payment was returned to the customer
 */
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

/**
 * The valid payment methods a user can choose at checkout.
 * Each method has different downstream behavior:
 * 'card'   → triggers Stripe checkout session creation
 * 'cash'   → no payment gateway, order is paid on delivery
 * 'paypal' → PayPal integration (bonus feature)
 * 'wallet' → deduct from user's stored wallet balance (bonus feature)
 */
export type PaymentMethod = 'creditCard' | 'cod' | 'paypal' | 'wallet';

/**
 * The shipping address the user provides at checkout.
 * Stored with the order so the address at time of purchase is preserved
 * even if the user later changes their profile address.
 */
export interface ShippingAddress {
  street: string;
  city: string;
  country: string;
  // Optional per the API contract — not all regions use postal codes
  postalCode?: string;
  phone: string;
}

/**
 * A single product line in an order.
 * Unlike CartItem which uses a bare productId string, OrderItem
 * typically stores the product details at time of purchase so
 * the order history shows accurate data even if the product changes later.
 * Adjust the productId type based on what your backend actually populates.
 */
export interface OrderItem {
  productId: string;
  title: string;
  description?: string;
  quantity: number;
  // The price after discount at time of purchase
  unitPrice: number;
  // The original price before discount at time of purchase
  price: number;
  // The discount percentage at time of purchase
  discount?: number;
  mainImage: CloudinaryImage;
}

/**
 * The full Order object as returned by the backend.
 * This is used in both the user's order history and the admin order panel.
 */
export interface Order {
  _id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  products: OrderItem[];
  shippingAddress: ShippingAddress;
  // The final amount the user paid or owes, after discounts and shipping
  totalPrice: number;
  couponCode?: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

/**
 * Body sent to POST /order/checkout to get the price breakdown
 * before the user commits to placing the order.
 * Both fields are optional — the backend can calculate with or without them.
 */
export interface CheckoutPayload {
  couponCode?: string;
  shippingAddress?: Partial<ShippingAddress>;
}

/**
 * Body sent to POST /order to actually place the order.
 * At this point the user has reviewed the summary and committed.
 */
export interface PlaceOrderPayload {
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  couponCode?: string;
}

/**
 * Body sent to PATCH /admin/orders/:orderId/status
 * Only admins can change order status via this payload.
 */
export interface UpdateOrderStatusPayload {
  orderStatus: OrderStatus;
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

/**
 * Response from POST /order/checkout.
 * Shows the price breakdown BEFORE the order is placed.
 * The checkout page displays these values so the user knows exactly
 * what they will be charged.
 */
export interface CheckoutSummary {
  subtotal: number;
  shipping: number;
  // The discount amount in currency, not percentage
  discount: number;
  total: number;
}

/**
 * Response from GET /order (user's order list).
 * Pagination is optional here because the API contract shows it
 * accepts page/limit params but doesn't explicitly show pagination
 * in the response — confirm with backend team and add if needed.
 */
export interface OrdersResponse {
  message: string;
  orders: Order[];
  pagination?: Pagination;
}

/**
 * Response from GET /order/:id, POST /order, PATCH /order/:id/cancel,
 * and PATCH /admin/orders/:orderId/status — all return a single order.
 */
export interface OrderResponse {
  message: string;
  order: Order;
}
