// ─────────────────────────────────────────────────────────────────────────────
// cart.model.ts
//
// Covers: Shopping cart data from the /cart endpoint.
// Used by: CartService, CartComponent, MainLayoutComponent (badge count),
//          ProductCardComponent (add to cart button).
// ─────────────────────────────────────────────────────────────────────────────

import { Product } from './product.model';

export interface CartItem {
  // We normalize raw backend data (which might have productId) into this shape.
  product: Product;
  quantity: number;
  price: number;
}

/**
 * Interface representing the potentially messy data directly from the backend.
 * Used only during the normalization phase in CartService.
 */
export interface RawCartItem {
  product?: Product | string;
  productId?: Product | string;
  quantity: number;
  price: number;
  _id?: string;
}

/**
 * The full Cart object returned by the backend.
 * A cart belongs to exactly one user and contains multiple products.
 */
export interface Cart {
  // The MongoDB ObjectId of the user who owns this cart
  userId: string;

  products: CartItem[];

  // The sum of (item.price * item.quantity) for all items.
  // Pre-calculated by the backend — do not recalculate on the frontend.
  totalPrice: number;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

/**
 * Body sent to POST /cart when adding an item.
 * quantity is optional — backend defaults to 1 if not provided.
 */
export interface AddToCartPayload {
  productId: string;
  quantity?: number;
}

/**
 * Body sent to PATCH /cart/:productId when changing quantity.
 * Two ways to update quantity:
 *   Option A: Send the exact new quantity → { quantity: 5 }
 *   Option B: Send an operator to increment/decrement → { operator: '+' }
 * Only one is needed per request — send one, not both.
 */
export interface UpdateCartPayload {
  quantity?: number;
  operator?: '+' | '-';
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

/**
 * Response from GET /cart, POST /cart, PATCH /cart/:productId,
 * DELETE /cart/:productId — all return the updated cart state.
 * CartService stores this in a signal so the header badge count
 * updates reactively whenever any cart operation succeeds.
 */
export interface CartResponse {
  message: string;
  cart: Cart;
}
