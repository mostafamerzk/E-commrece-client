// ─────────────────────────────────────────────────────────────────────────────
// seller.model.ts
//
// Covers: Seller-specific data from the /seller endpoint.
// Used by: SellerService, SellerProfileComponent, SellerInventoryComponent.
//
// NOTE: The seller profile IS a User object with extra seller-specific fields.
// The backend returns the full user object from GET /seller/profile, so we
// extend the User interface rather than defining a completely separate shape.
// This avoids duplicating fields like _id, email, role, isBlocked.
// ─────────────────────────────────────────────────────────────────────────────

import { CloudinaryImage } from './shared.model';
import { User } from './auth.model';
import { Order } from './order.model';
import { Product } from './product.model';

/**
 * A seller's complete profile — the User object plus seller-specific fields.
 *
 * We use intersection type (&) to say "everything in User PLUS these extra fields."
 * This is better than re-typing all User fields here, because if User changes,
 * SellerProfile automatically gets the updated fields too.
 *
 * When the backend returns GET /seller/profile, it returns the full user object
 * which includes storeName, phone, etc. already defined as optional on User.
 * This type just makes them explicit and required for a seller context.
 */
export interface SellerProfile extends User {
  storeName: string;
  storeDescription?: string;
  phone: string;
  storeImage?: CloudinaryImage;
}

/**
 * A single inventory line item from GET /seller/inventory.
 * Shows the seller a stock-level overview of each product they own.
 */
export interface InventoryItem {
  productId: string;
  title: string;
  stock: number;
  // How many units have been sold across all orders
  sold: number;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

/**
 * Body sent to PATCH /seller/profile.
 * All fields optional because the seller may only want to update
 * one or two fields at a time. The storeImage file is handled
 * via FormData in the service, not included here.
 */
export interface UpdateSellerProfilePayload {
  storeName?: string;
  storeDescription?: string;
  phone?: string;
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

/**
 * Response from GET /seller/profile and PATCH /seller/profile.
 * The backend returns the user object (which includes seller fields).
 */
export interface SellerProfileResponse {
  message: string;
  user: SellerProfile;
}

export interface SellerProductsResponse {
  message: string;
  products: Product[];
}

export interface InventoryResponse {
  message: string;
  inventory: InventoryItem[];
}

/**
 * Response from GET /seller/orders (bonus feature).
 * Returns orders that contain at least one product owned by this seller.
 */
export interface SellerOrdersResponse {
  message: string;
  orders: Order[];
}
