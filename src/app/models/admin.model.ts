// ─────────────────────────────────────────────────────────────────────────────
// admin.model.ts
//
// Covers: Admin-specific query params and response shapes from /admin endpoints.
// Used by: AdminService (all admin API calls), AdminUsersComponent,
//          AdminOrdersComponent, AdminProductsComponent, AdminBannersComponent.
//
// NOTE: The core data shapes (User, Product, Order, Banner) are defined in their
// own model files. This file only defines admin-specific query param interfaces
// and the admin-flavored response wrappers (which sometimes differ slightly
// from the public endpoint responses — e.g. admin gets isDeleted products).
// ─────────────────────────────────────────────────────────────────────────────

import { Pagination } from './shared.model';
import { User } from './auth.model';
import { Product } from './product.model';
import { Order, OrderStatus } from './order.model';

// ─── Query Param Interfaces ────────────────────────────────────────────────────
// These type the query params accepted by each admin list endpoint.
// Using typed interfaces prevents accidentally passing unknown filter keys.

/**
 * Query params for GET /admin/users
 */
export interface AdminUserQueryParams {
  search?: string;
  page?: string;
  limit?: string;
}

/**
 * Query params for GET /admin/products
 * More filter options than the public endpoint — admin can see by stock, rating, etc.
 */
export interface AdminProductQueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  // "true" or "false" as string — HTTP params are always strings
  inStock?: string;
  search?: string;
}

/**
 * Query params for GET /admin/orders
 * Extensive filter set because admins need to find specific orders quickly.
 */
export interface AdminOrderQueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  status?: OrderStatus;
  paymentStatus?: string;
  shippingStatus?: string;
  minTotal?: string;
  maxTotal?: string;
  // ISO date strings e.g. "2024-01-01"
  startDate?: string;
  endDate?: string;
}

/**
 * Query params for GET /admin/banners
 */
export interface AdminBannerQueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  isActive?: string;
  search?: string;
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

/**
 * Response from GET /admin/users
 */
export interface AdminUsersResponse {
  message: string;
  users: User[];
  pagination?: Pagination;
}

/**
 * Response from GET /admin/users/:userId
 * Note: the API contract uses 'data' instead of 'user' as the key.
 * This is a backend inconsistency — match it exactly so the service
 * can correctly read response.data instead of response.user.
 */
export interface AdminUserResponse {
  message: string;
  data: User;
}

/**
 * Response from GET /admin/products
 * Admin version returns ALL products including soft-deleted ones
 * (isDeleted: true), unlike the public endpoint which filters them out.
 */
export interface AdminProductsResponse {
  message: string;
  products: Product[];
  pagination?: Pagination;
}

/**
 * Response from GET /admin/products/:productId
 * Note: uses 'data' key — same backend inconsistency as AdminUserResponse.
 */
export interface AdminProductResponse {
  message: string;
  data: Product;
}

/**
 * Response from GET /admin/orders
 */
export interface AdminOrdersResponse {
  message: string;
  orders: Order[];
  pagination?: Pagination;
}

/**
 * Response from GET /admin/orders/:orderId
 * Note: uses 'data' key — same pattern as other admin single-item endpoints.
 */
export interface AdminOrderResponse {
  message: string;
  data: Order;
}
