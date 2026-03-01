// ─────────────────────────────────────────────────────────────────────────────
// cart.model.ts
//
// Covers: Shopping cart data from the /cart endpoint.
// Used by: CartService, CartComponent, MainLayoutComponent (badge count),
//          ProductCardComponent (add to cart button).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single line item inside the cart.
 * Notice that productId here is a string (the MongoDB ObjectId), NOT a full
 * Product object. The backend returns the bare ID in most cart responses.
 * If you need the full product details (title, image) alongside cart items,
 * the backend may populate this — confirm with the backend team whether
 * productId is populated or just a string in the actual response.
 * If it IS populated, change productId type to: string | Product
 */
export interface CartItem {
  // The product's MongoDB ObjectId — or a populated Product object
  // if the backend populates this field (check with backend team)
  productId: string;

  quantity: number;

  // The price per unit at the time the item was added to cart.
  // Stored separately from the product price because product prices
  // can change — the cart price is locked at the time of adding.
  price: number;
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
